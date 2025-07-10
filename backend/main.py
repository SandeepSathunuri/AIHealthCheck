from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
import datetime
import aiofiles
import os
import time
from typing import Optional
from dotenv import load_dotenv
from gridfs import GridFS
from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_doctor import text_to_speech_with_elevenlabs
from voice_of_the_patient import transcribe_with_groq

# Load environment variables
load_dotenv()

# Connect to MongoDB
try:
    client = MongoClient(os.environ.get('MONGO_CONN'))
    client.server_info()  # Test connection
    print("MongoDB connected successfully")
except ServerSelectionTimeoutError as e:
    print("MongoDB connection failed:", e)
    raise Exception("Database connection error")

db = client["test"]
users_collection = db["users"]
diagnoses_collection = db["diagnoses"]
fs = GridFS(db)  # Initialize GridFS

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

system_prompt = """You have to act as a professional doctor, i know you are not but this is for learning purpose. 
What's in this image?. Do you find anything wrong with it medically? 
If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
Donot say 'In the image I see' but say 'With what I see, I think you have ....'
Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")  
SECRET_KEY = os.environ.get("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=403,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print(f"Attempting to get token from request...") 
    try:
        print(f"Received token: {token}")  
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")  
        email: str = payload.get("sub")
        if email is None:
            print("No email in payload") 
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"JWTError: {e}")
        raise credentials_exception
    user = users_collection.find_one({"email": token_data.email})
    print(f"Found user: {user}")
    if user is None:
        print("User not found in DB")
        raise credentials_exception
    return user

# Routes
@app.post("/auth/signup")
async def signup(user: UserCreate):
    try:
        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=409, detail="User already exists, please login")
        hashed_password = get_password_hash(user.password)
        users_collection.insert_one({
            "name": user.name,
            "email": user.email,
            "password": hashed_password
        })
        return {"message": "Signup successful", "success": True}
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="User already exists, please login")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/auth/login")
async def login(user: UserLogin):
    print("Login function called with:", user.email, user.password)
    try:
        print("Attempting login for email:", user.email)  
        db_user = users_collection.find_one({"email": user.email})
        print("DB User:", db_user)
        if not db_user:
            print("User not found") 
            raise HTTPException(status_code=403, detail="Invalid email or password")
        if not verify_password(user.password, db_user["password"]):
            print("Password mismatch") 
            raise HTTPException(status_code=403, detail="Invalid email or password")
        access_token = create_access_token(data={"sub": user.email})
        print("Login successful, token:", access_token) 
        return {
            "message": "Login successful",
            "success": True,
            "jwtToken": access_token,
            "email": user.email,
            "name": db_user["name"]
        }
    except Exception as e:
        print("Login error:", str(e))  
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/medibot/process")
async def process(
    audio: UploadFile = File(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        print("📥 Received request")

        # Read audio and image content once
        audio_content = await audio.read()
        image_content = await image.read()

        # Save uploaded files to GridFS
        image_id = fs.put(image_content, filename=image.filename)
        print("✅ Image saved to GridFS")

        audio_id = fs.put(audio_content, filename=audio.filename)
        print("✅ Audio saved to GridFS")

        # Transcribe audio using the saved content (save to temp file)
        temp_audio_path = f"uploads/temp_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{audio.filename}"
        async with aiofiles.open(temp_audio_path, "wb") as f:
            await f.write(audio_content)  # Use the pre-read content
        transcription = transcribe_with_groq(
            GROQ_API_KEY=os.environ.get("GROQ_API_KEY"),
            audio_filepath=temp_audio_path,
            stt_model="whisper-large-v3"
        )
        # Retry file deletion if in use
        max_attempts = 5
        for attempt in range(max_attempts):
            try:
                os.remove(temp_audio_path)  # Clean up temp file
                print(f"✅ Transcription: {transcription} (File deleted on attempt {attempt + 1})")
                break
            except PermissionError:
                if attempt < max_attempts - 1:
                    time.sleep(0.5)  # Wait 500ms before retrying
                    print(f"Attempt {attempt + 1} failed to delete {temp_audio_path}, retrying...")
                else:
                    print(f"Failed to delete {temp_audio_path} after {max_attempts} attempts, leaving file.")
        else:
            print(f"Warning: Temp file {temp_audio_path} not deleted due to lock.")

        # Analyze image + transcription
        # Adjust encode_image to handle GridFS file ID if needed
        encoded_image = encode_image(image_id)  # Modify encode_image to accept GridFS ID
        doctor_response = analyze_image_with_query(
            query=system_prompt + transcription,
            encoded_image=encoded_image,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )
        print("✅ Doctor's response:", doctor_response)

        # Generate TTS and save to GridFS
        temp_output_path = f"uploads/temp_output_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
        text_to_speech_with_elevenlabs(input_text=doctor_response, output_filepath=temp_output_path)
        output_audio_id = fs.put(open(temp_output_path, "rb").read(), filename="final.mp3")
        os.remove(temp_output_path)  # Clean up temp file
        print("✅ Output audio saved to GridFS")

        # Save metadata to MongoDB
        diagnoses_collection.insert_one({
            "userEmail": current_user["email"],
            "imageId": image_id,
            "audioInputId": audio_id,
            "audioOutputId": output_audio_id,
            "transcription": transcription,
            "doctorResponse": doctor_response,
            "createdAt": datetime.datetime.utcnow()
        })
        print("✅ Saved to MongoDB")

        return JSONResponse(content={
            "message": "Record saved successfully",
            "transcription": transcription,
            "doctor_response": doctor_response,
            "audio_url": f"http://localhost:8080/medibot/audio-response",
            "image_url": f"http://localhost:8080/medibot/image-response"
        })

    except Exception as e:
        import traceback
        print("🔥 Server Error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/medibot/audio-response")
async def get_audio_response(current_user: dict = Depends(get_current_user)):
    audio_id = diagnoses_collection.find_one(sort=[("createdAt", -1)])["audioOutputId"]
    audio_file = fs.get(audio_id)
    return StreamingResponse(
        iter([audio_file.read()]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=final.mp3"}
    )

@app.get("/medibot/image-response")
async def get_image_response(current_user: dict = Depends(get_current_user)):
    image_id = diagnoses_collection.find_one(sort=[("createdAt", -1)])["imageId"]
    image_file = fs.get(image_id)
    return StreamingResponse(
        iter([image_file.read()]),
        media_type="image/jpeg",
        headers={"Content-Disposition": "inline; filename=temp_image.jpg"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)