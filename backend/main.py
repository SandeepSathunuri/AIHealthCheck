from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
from dotenv import load_dotenv
from typing import Optional
import aiofiles
import datetime
import os
from bson import ObjectId

# Custom logic modules
from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_doctor import text_to_speech_with_elevenlabs
from voice_of_the_patient import transcribe_with_groq

# Load environment variables
load_dotenv()
os.makedirs("uploads", exist_ok=True)

# Constants
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-key")
MONGO_URI = os.getenv("MONGO_CONN", "mongodb://localhost:27017/")
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
ALGORITHM = "HS256"

# MongoDB connection
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✅ MongoDB connected")
except ServerSelectionTimeoutError as e:
    raise Exception(f"❌ MongoDB connection failed: {e}")

db = client["test"]
users_collection = db["users"]
diagnoses_collection = db["diagnoses"]

# FastAPI app
app = FastAPI(title="AI Doctor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# System Prompt
system_prompt = """
You have to act as a professional doctor... [trimmed for brevity; retain original in code]
"""

# ---------------------- Models ----------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ---------------------- Utility Functions ----------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=403, detail="Invalid token: email not found")
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=403, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=403, detail="Could not validate token")

# ---------------------- Routes ----------------------
@app.post("/auth/signup", tags=["Auth"])
async def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="User already exists")
    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": get_password_hash(user.password)
    })
    return {"message": "Signup successful", "success": True}

@app.post("/auth/login", tags=["Auth"])
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=403, detail="Invalid email or password")
    token = create_access_token({"sub": user.email})
    return {
        "message": "Login successful",
        "success": True,
        "jwtToken": token,
        "email": user.email,
        "name": db_user["name"]
    }

@app.post("/medibot/process", tags=["Medibot"])
async def process(audio: UploadFile = File(...), image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    audio_path = f"uploads/{timestamp}_{audio.filename}"
    image_path = f"uploads/{timestamp}_{image.filename}"

    try:
        # Save files
        async with aiofiles.open(audio_path, "wb") as f:
            await f.write(await audio.read())
        async with aiofiles.open(image_path, "wb") as f:
            await f.write(await image.read())

        # Process
        transcription = transcribe_with_groq(
            GROQ_API_KEY=os.getenv("GROQ_API_KEY"),
            audio_filepath=audio_path,
            stt_model="whisper-large-v3"
        )
        encoded_image = encode_image(image_path)
        doctor_response = analyze_image_with_query(
            query=system_prompt + transcription,
            encoded_image=encoded_image,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )
        audio_output_path = f"uploads/final_{timestamp}.mp3"
        text_to_speech_with_elevenlabs(input_text=doctor_response, output_filepath=audio_output_path)

        # Store record
        diagnosis = {
            "userEmail": current_user["email"],
            "imagePath": image_path,
            "audioPath": audio_path,
            "transcription": transcription,
            "doctorResponse": doctor_response,
            "audioOutputPath": audio_output_path,
            "createdAt": datetime.datetime.utcnow()
        }
        inserted = diagnoses_collection.insert_one(diagnosis)

        return {
            "message": "Record saved successfully",
            "transcription": transcription,
            "doctor_response": doctor_response,
            "audio_url": f"http://localhost:8080/medibot/audio-response/{inserted.inserted_id}"
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/medibot/audio-response/{diagnosis_id}", tags=["Medibot"])
async def get_audio_response(diagnosis_id: str):
    record = diagnoses_collection.find_one({"_id": ObjectId(diagnosis_id)})
    if not record or not os.path.exists(record["audioOutputPath"]):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(record["audioOutputPath"], media_type="audio/mpeg", filename="final.mp3")

@app.get("/medibot/history", tags=["Medibot"])
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        records_cursor = diagnoses_collection.find({"userEmail": current_user["email"]}).sort("createdAt", -1)

        records = []
        for r in records_cursor:
            record = {
                "_id": str(r.get("_id")),
                "userEmail": r.get("userEmail"),
                "imagePath": r.get("imagePath"),
                "audioPath": r.get("audioPath"),
                "transcription": r.get("transcription"),
                "doctorResponse": r.get("doctorResponse"),
                "audioOutputPath": r.get("audioOutputPath"),
                "createdAt": r.get("createdAt").isoformat() if r.get("createdAt") else None,
            }
            records.append(record)

        return {"success": True, "history": records}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"History fetch error: {str(e)}")

# ---------------------- Entry ----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
