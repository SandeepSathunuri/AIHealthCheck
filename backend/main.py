from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
from gridfs import GridFS, NoFile
from dotenv import load_dotenv
from typing import Optional
from bson import ObjectId
from bson.errors import InvalidId
import datetime
import traceback
import base64
import os
from concurrent.futures import ThreadPoolExecutor

# Load environment variables
load_dotenv()

# Custom modules
from brain_of_the_doctor import analyze_image_with_query
from voice_of_the_doctor import text_to_speech_with_elevenlabs
from voice_of_the_patient import transcribe_with_groq

# Constants
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-key")
MONGO_URI = os.getenv("MONGO_CONN", "mongodb://localhost:27017/")
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
ALGORITHM = "HS256"

# MongoDB setup
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✅ MongoDB connected")
except ServerSelectionTimeoutError as e:
    raise Exception(f"❌ MongoDB connection failed: {e}")

db = client["test"]
fs = GridFS(db)
users_collection = db["users"]
diagnoses_collection = db["diagnoses"]

# FastAPI app setup
app = FastAPI(title="AI Doctor Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
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
            raise HTTPException(status_code=403, detail="Invalid token")
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=403, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=403, detail="Token validation error")

# Prompt for doctor analysis
system_prompt = (
    """You have to act as a professional doctor, i know you are not but this is for learning purpose. 
    What's in this image?. Do you find anything wrong with it medically? 
    If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
    your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
    Donot say 'In the image I see' but say 'With what I see, I think you have ....'
    Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
    Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""
)

# ---------------------- Models ----------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DiagnosisCreate(BaseModel):
    transcription: str
    doctorResponse: str
    createdAt: Optional[datetime.datetime] = None

class DiagnosisUpdate(BaseModel):
    transcription: Optional[str]
    doctorResponse: Optional[str]

# ---------------------- Auth Routes ----------------------
@app.post("/auth/signup")
async def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="User already exists")
    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    })
    return {"message": "Signup successful", "success": True}

@app.post("/auth/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {
        "message": "Login successful",
        "success": True,
        "jwtToken": token,
        "email": user.email,
        "name": db_user["name"]
    }

# ---------------------- Medibot Routes ----------------------
def process_audio_image(audio_data, image_data, current_user):
    audio_id = fs.put(audio_data)
    image_id = fs.put(image_data)
    print(f"Debug: Stored audio_id: {audio_id}, image_id: {image_id}")

    # Use ThreadPoolExecutor for parallel execution
    with ThreadPoolExecutor() as executor:
        transcription_future = executor.submit(
            transcribe_with_groq,
            GROQ_API_KEY=os.getenv("GROQ_API_KEY"),
            audio_bytes=audio_data,
            stt_model="whisper-large-v3"
        )
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        analysis_future = executor.submit(
            analyze_image_with_query,
            query=system_prompt + "placeholder",  # Updated with transcription result
            encoded_image=encoded_image,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )

        transcription = transcription_future.result()
        doctor_response = analysis_future.result().replace("placeholder", transcription)

    # Generate audio directly
    output_audio = text_to_speech_with_elevenlabs(doctor_response)
    if output_audio is None:
        raise HTTPException(status_code=500, detail="Failed to generate audio for storage")
    audio_output_id = fs.put(output_audio, filename="doctor_response.mp3")

    diagnosis = {
        "userEmail": current_user["email"],
        "imageFileId": str(image_id),
        "audioFileId": str(audio_id),
        "transcription": transcription,
        "doctorResponse": doctor_response,
        "audioOutputId": str(audio_output_id),
        "createdAt": datetime.datetime.utcnow()
    }
    diagnoses_collection.insert_one(diagnosis)

    return {
        "message": "Record saved successfully",
        "transcription": transcription,
        "doctor_response": doctor_response,
        "image_url": f"http://localhost:8080/medibot/image/{image_id}",
        "audio_url": f"http://localhost:8080/medibot/audio/{audio_output_id}"
    }

@app.post("/medibot/process")
async def process(audio: UploadFile = File(...), image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        audio_data = await audio.read()
        image_data = await image.read()
        return process_audio_image(audio_data, image_data, current_user)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/medibot/history")
async def create_diagnosis(diagnosis: DiagnosisCreate, current_user: dict = Depends(get_current_user)):
    try:
        diagnosis_data = {
            "userEmail": current_user["email"],
            "transcription": diagnosis.transcription,
            "doctorResponse": diagnosis.doctorResponse,
            "createdAt": diagnosis.createdAt or datetime.datetime.utcnow(),
            "imageFileId": None,
            "audioFileId": None,
            "audioOutputId": None
        }
        result = diagnoses_collection.insert_one(diagnosis_data)
        return {"success": True, "message": "Diagnosis created successfully", "id": str(result.inserted_id)}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create diagnosis: {str(e)}")

@app.put("/medibot/history/{diagnosis_id}")
async def update_diagnosis(diagnosis_id: str, diagnosis: DiagnosisUpdate, current_user: dict = Depends(get_current_user)):
    try:
        diagnosis_id = ObjectId(diagnosis_id)
        existing_diagnosis = diagnoses_collection.find_one({"_id": diagnosis_id, "userEmail": current_user["email"]})
        if not existing_diagnosis:
            raise HTTPException(status_code=404, detail="Diagnosis not found or not authorized")
        
        update_data = {}
        if diagnosis.transcription is not None:
            update_data["transcription"] = diagnosis.transcription
        if diagnosis.doctorResponse is not None:
            update_data["doctorResponse"] = diagnosis.doctorResponse
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = diagnoses_collection.update_one(
            {"_id": diagnosis_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return {"success": True, "message": "Diagnosis updated successfully"}
        else:
            raise HTTPException(status_code=400, detail="No changes applied")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid diagnosis ID")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update diagnosis: {str(e)}")

@app.delete("/medibot/history/{diagnosis_id}")
async def delete_diagnosis(diagnosis_id: str, current_user: dict = Depends(get_current_user)):
    try:
        diagnosis_id = ObjectId(diagnosis_id)
        existing_diagnosis = diagnoses_collection.find_one({"_id": diagnosis_id, "userEmail": current_user["email"]})
        if not existing_diagnosis:
            raise HTTPException(status_code=404, detail="Diagnosis not found or not authorized")
        
        # Optionally delete associated files from GridFS
        for file_id in [existing_diagnosis.get("imageFileId"), existing_diagnosis.get("audioFileId"), existing_diagnosis.get("audioOutputId")]:
            if file_id:
                try:
                    fs.delete(ObjectId(file_id))
                except (InvalidId, NoFile):
                    pass
        
        result = diagnoses_collection.delete_one({"_id": diagnosis_id})
        if result.deleted_count:
            return {"success": True, "message": "Diagnosis deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete diagnosis")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid diagnosis ID")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete diagnosis: {str(e)}")

@app.get("/medibot/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        records_cursor = diagnoses_collection.find({"userEmail": current_user["email"]}).sort("createdAt", -1)
        records = []
        for r in records_cursor:
            image_id = r.get("imageFileId")
            audio_output_id = r.get("audioOutputId")
            print(f"Debug: Processing record - imageId: {image_id}, audioOutputId: {audio_output_id}")

            records.append({
                "id": str(r.get("_id")),
                "userEmail": r.get("userEmail"),
                "transcription": r.get("transcription"),
                "doctorResponse": r.get("doctorResponse"),
                "createdAt": r.get("createdAt").isoformat() if r.get("createdAt") else None,
                "imagePath": f"medibot/image/{image_id}" if image_id else None,
                "audioOutputPath": f"medibot/audio/{audio_output_id}" if audio_output_id else None
            })
        print(f"Debug: Returning {len(records)} records")
        return {"success": True, "history": records}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"History fetch error: {str(e)}")

@app.get("/medibot/image/{image_id}", tags=["Medibot"])
def get_image(image_id: str):
    try:
        print("🖼️ Getting image ID:", image_id)
        if not image_id or image_id.lower() == "none":
            raise HTTPException(status_code=400, detail="Invalid image ID")
        
        image_file = fs.get(ObjectId(image_id))
        image_data = image_file.read()
        print(f"🖼️ Image data length: {len(image_data)}")
        if image_data.startswith(b'\xFF\xD8'):  # JPEG
            media_type = "image/jpeg"
        elif image_data.startswith(b'\x89PNG'):  # PNG
            media_type = "image/png"
        else:
            media_type = "application/octet-stream"
        return Response(content=image_data, media_type=media_type)
    except InvalidId:
        print(f"🖼️ Invalid ObjectId: {image_id}")
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    except NoFile:
        print(f"🖼️ No file found for ID: {image_id}")
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        print(f"🖼️ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/medibot/audio/{audio_id}")
def get_audio(audio_id: str):
    try:
        if not audio_id or audio_id.lower() == "none":
            raise HTTPException(status_code=400, detail="Invalid audio ID")
        audio_file = fs.get(ObjectId(audio_id))
        return StreamingResponse(audio_file, media_type="audio/mpeg")
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    except NoFile:
        raise HTTPException(status_code=404, detail="Audio not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)