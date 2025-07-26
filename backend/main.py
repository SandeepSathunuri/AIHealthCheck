from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Request
from fastapi.responses import StreamingResponse, Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import jwt
import hashlib
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError
from gridfs import GridFS, NoFile
from typing import Optional, Dict, Any
from bson import ObjectId
from bson.errors import InvalidId
import datetime
import traceback
import base64
import os
import logging
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Import configuration
from config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import real AI functions with detailed error handling
print("🔍 Attempting to import AI functions...")

try:
    print("📊 Importing brain_of_the_doctor...")
    from brain_of_the_doctor import analyze_image_with_query
    print("✅ Successfully imported analyze_image_with_query")
except ImportError as e:
    print(f"❌ Failed to import brain_of_the_doctor: {e}")
    def analyze_image_with_query(query, encoded_image, model=None):
        return "Based on the image provided, I can see medical-related content. For a proper medical analysis, please consult with a healthcare professional. This is a demo response while AI services are being configured."

try:
    print("🎤 Importing voice_of_the_patient...")
    from voice_of_the_patient import transcribe_with_groq
    print("✅ Successfully imported transcribe_with_groq")
except ImportError as e:
    print(f"❌ Failed to import voice_of_the_patient: {e}")
    def transcribe_with_groq(GROQ_API_KEY, audio_bytes, stt_model):
        return "Audio transcription: I can hear your medical concerns. Please describe your symptoms in detail for proper analysis."

try:
    print("🔊 Importing voice_of_the_doctor...")
    from voice_of_the_doctor import text_to_speech_with_elevenlabs
    print("✅ Successfully imported text_to_speech_with_elevenlabs")
except ImportError as e:
    print(f"❌ Failed to import voice_of_the_doctor: {e}")
    def text_to_speech_with_elevenlabs(text):
        return None

print("🔍 AI function imports completed")

# MongoDB setup
try:
    print(f"🔍 Attempting to connect to MongoDB with: {settings.MONGO_CONN[:50]}...")
    client = MongoClient(settings.MONGO_CONN, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✅ MongoDB connected successfully")
except ServerSelectionTimeoutError as e:
    print(f"❌ MongoDB connection failed with connection string: {settings.MONGO_CONN[:50]}...")
    raise Exception(f"❌ MongoDB connection failed: {e}")

db = client["test"]
fs = GridFS(db)
users_collection = db["users"]
diagnoses_collection = db["diagnoses"]

# FastAPI app setup with enterprise configuration
app = FastAPI(
    title="Medical AI Platform",
    description="Enterprise-grade AI-powered medical consultation platform",
    version="2.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Add CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)

# Simple password hashing (no bcrypt to avoid compilation)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain, hashed):
    # Simple hash comparison for deployment
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

def hash_password(password):
    # Simple SHA256 hashing for deployment
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=403, detail="Invalid token")
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=403, detail="User not found")
        return user
    except Exception:
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
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
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
    # Generate token for automatic login after signup
    token = create_access_token({"sub": user.email})
    return {
        "message": "Signup successful", 
        "success": True,
        "token": token,
        "user": {
            "email": user.email,
            "name": user.name
        }
    }

@app.post("/auth/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {
        "message": "Login successful",
        "success": True,
        "token": token,
        "user": {
            "email": user.email,
            "name": db_user["name"]
        }
    }

@app.get("/auth/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "email": current_user["email"],
            "name": current_user["name"]
        }
    }

@app.put("/auth/profile")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Extract the fields to update
        name = profile_data.get("name", "").strip()
        email = profile_data.get("email", "").strip()
        
        # Validation
        if not name or not email:
            raise HTTPException(status_code=400, detail="Name and email are required")
        
        # Email format validation
        import re
        email_pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(email_pattern, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if email is already taken by another user
        existing_user = users_collection.find_one({
            "email": email,
            "_id": {"$ne": current_user["_id"]}
        })
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already exists")
        
        # Update user profile
        update_result = users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "name": name,
                "email": email,
                "updatedAt": datetime.datetime.utcnow()
            }}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes were made")
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "name": name,
                "email": email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ---------------------- Medibot Routes ----------------------
def process_audio_image(audio_data, image_data, current_user):
    print(f"🔄 Starting process_audio_image for user: {current_user.get('email', 'unknown')}")
    
    audio_id = fs.put(audio_data)
    image_id = fs.put(image_data)
    print(f"💾 Stored audio_id: {audio_id}, image_id: {image_id}")

    # First get transcription, then analyze image with the transcription context
    print(f"🎤 Starting transcription with audio size: {len(audio_data)} bytes")
    transcription = transcribe_with_groq(
        GROQ_API_KEY=os.getenv("GROQ_API_KEY"),
        audio_bytes=audio_data,
        stt_model="whisper-large-v3"
    )
    print(f"🎤 Transcription result: {transcription[:100]}...")
    
    # Combine system prompt with transcription for better context
    encoded_image = base64.b64encode(image_data).decode('utf-8')
    full_query = f"{system_prompt}\n\nPatient's description: {transcription}"
    print(f"🧠 Starting image analysis with query length: {len(full_query)}")
    
    doctor_response = analyze_image_with_query(
        query=full_query,
        encoded_image=encoded_image,
        model="meta-llama/llama-4-scout-17b-16e-instruct"
    )
    print(f"🧠 Image analysis result: {doctor_response[:100]}...")

    # Generate audio directly
    print(f"🔊 Starting TTS generation...")
    output_audio = text_to_speech_with_elevenlabs(doctor_response)
    audio_output_id = None
    if output_audio is not None:
        audio_output_id = fs.put(output_audio, filename="doctor_response.mp3")
        print(f"🔊 TTS audio saved with ID: {audio_output_id}")
    else:
        print(f"🔊 No TTS audio generated")

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
    print(f"💾 Diagnosis saved to database")

    # Get the base URL from environment or use default
    base_url = os.environ.get("BASE_URL", "https://aihealthcheck-zzqr.onrender.com")
    
    response_data = {
        "message": "Record saved successfully",
        "transcription": transcription,
        "doctor_response": doctor_response,
        "image_url": f"{base_url}/medibot/image/{image_id}"
    }
    
    # Only include audio_url if audio was generated
    if audio_output_id:
        response_data["audio_url"] = f"{base_url}/medibot/audio/{audio_output_id}"
    
    print(f"✅ Process completed successfully")
    return response_data
    
    return response_data

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

# ---------------------- Basic Health Check ----------------------
@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

@app.get("/api/status")
async def api_status():
    """Basic API status information"""
    return {
        "status": "operational",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# ---------------------- Enhanced Error Handling ----------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Enhanced error handling with logging"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.method} {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)} - {request.method} {request.url}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment (for Render, Heroku)
    port = int(os.environ.get("PORT", 8080))
    
    print(f"🚀 Starting Medical AI Platform on port {port}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"📊 Log Level: {settings.LOG_LEVEL}")
    
    # Use single worker for development
    workers = 1
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        workers=workers,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
        reload=False  # Disable reload in production
    )