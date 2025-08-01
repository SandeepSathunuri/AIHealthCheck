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
import warnings

# Suppress ffmpeg/pydub warnings globally
warnings.filterwarnings("ignore", message="Couldn't find ffmpeg or avconv")
warnings.filterwarnings("ignore", category=RuntimeWarning, module="pydub")

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
    print("🌐 Importing google_tts (Google TTS solution)...")
    from google_tts import text_to_speech_with_elevenlabs
    print("✅ Successfully imported Google TTS system")
except ImportError as e:
    print(f"❌ Failed to import google_tts: {e}")
    def text_to_speech_with_elevenlabs(text):
        print("🔊 Using fallback TTS function")
        return None

print("🔍 AI function imports completed")

# Google TTS ready - no pre-loading needed
print("🌐 Google TTS system ready - using free Google Translate API")
print("🚀 Server will start immediately with Google TTS support")

# MongoDB setup with retry logic
def connect_to_mongodb(max_retries=3, retry_delay=2):
    """Connect to MongoDB with retry logic for better reliability"""
    import time
    
    for attempt in range(max_retries):
        try:
            print(f"🔍 MongoDB connection attempt {attempt + 1}/{max_retries}...")
            print(f"🔗 Connection string: {settings.MONGO_CONN[:50]}...")
            
            # More robust connection settings
            client = MongoClient(
                settings.MONGO_CONN,
                serverSelectionTimeoutMS=10000,  # 10 seconds
                connectTimeoutMS=10000,          # 10 seconds
                socketTimeoutMS=10000,           # 10 seconds
                retryWrites=True,                # Enable retry writes
                w="majority"                     # Write concern
            )
            
            # Test connection
            client.admin.command('ping')
            print("✅ MongoDB connected successfully")
            return client
            
        except Exception as e:
            print(f"⚠️ MongoDB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("❌ All MongoDB connection attempts failed")
                print("🔧 Possible solutions:")
                print("   - Check MongoDB Atlas cluster status")
                print("   - Verify network connectivity")
                print("   - Check IP whitelist settings")
                print("   - Verify connection string credentials")
                raise Exception(f"❌ MongoDB connection failed after {max_retries} attempts: {e}")

# Connect to MongoDB with graceful fallback
try:
    client = connect_to_mongodb()
    db = client["test"]
    print("🗄️ Database connection established")
except Exception as e:
    print(f"❌ Critical: MongoDB connection failed - server cannot start")
    print(f"🔧 Error: {e}")
    print("💡 Please check your MongoDB Atlas configuration and try again")
    raise e
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
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    print(f"🔐 Created token for {data.get('sub', 'unknown')} expires at {expire}")
    return token

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        print(f"🔐 Token validation attempt for token: {token[:20]}...")
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        print(f"🔐 Token decoded successfully, payload: {payload}")
        
        email = payload.get("sub")
        if not email:
            print("❌ No email in token payload")
            raise HTTPException(status_code=403, detail="Invalid token")
        
        print(f"🔐 Looking up user: {email}")
        user = users_collection.find_one({"email": email})
        if not user:
            print(f"❌ User not found in database: {email}")
            raise HTTPException(status_code=403, detail="User not found")
        
        print(f"✅ User authenticated successfully: {email}")
        return user
    except jwt.ExpiredSignatureError:
        print("❌ Token has expired")
        raise HTTPException(status_code=403, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {e}")
        raise HTTPException(status_code=403, detail="Invalid token")
    except Exception as e:
        print(f"❌ Token validation error: {e}")
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
    try:
        print(f"🚀 Starting ULTRA-FAST process_audio_image for user: {current_user.get('email', 'unknown')}")
        
        # SPEED OPTIMIZATION: Parallel file storage and image encoding
        import concurrent.futures
        import threading
        
        # Pre-encode image for faster processing
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        
        # Parallel storage operations with timeout
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            audio_future = executor.submit(fs.put, audio_data)
            image_future = executor.submit(fs.put, image_data)
            
            try:
                audio_id = audio_future.result(timeout=10)
                image_id = image_future.result(timeout=10)
            except concurrent.futures.TimeoutError:
                print("⚠️ File storage timeout - using fallback IDs")
                audio_id = "storage_timeout"
                image_id = "storage_timeout"
        
        print(f"🚀 FAST storage complete - audio_id: {audio_id}, image_id: {image_id}")

        # SPEED OPTIMIZATION: Fast transcription with timeout
        print(f"🚀 Starting FAST transcription with audio size: {len(audio_data)} bytes")
        
        def fast_transcription():
            return transcribe_with_groq(
                GROQ_API_KEY=os.getenv("GROQ_API_KEY"),
                audio_bytes=audio_data,
                stt_model="whisper-large-v3"
            )
        
        # Run transcription with timeout
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(fast_transcription)
            try:
                transcription = future.result(timeout=15)  # 15s timeout
            except concurrent.futures.TimeoutError:
                transcription = "Audio transcription timeout - proceeding with image analysis"
            except Exception as e:
                transcription = f"Transcription error - proceeding with image analysis"
        
        print(f"🚀 FAST transcription result: {transcription[:100]}...")
        
        # SPEED OPTIMIZATION: Shorter, optimized query
        short_query = f"Medical analysis: {transcription[:200]}"  # Truncate for speed
        print(f"🚀 Starting FAST image analysis with query length: {len(short_query)}")
        
        def fast_image_analysis():
            return analyze_image_with_query(
                query=short_query,
                encoded_image=encoded_image,
                model="meta-llama/llama-4-scout-17b-16e-instruct"
            )
        
        # Run image analysis with timeout
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(fast_image_analysis)
            try:
                ai_analysis = future.result(timeout=20)  # 20s timeout
                
                # Handle new response format with detailed analysis and recommendations
                if isinstance(ai_analysis, dict):
                    doctor_detailed_analysis = ai_analysis.get("detailed_analysis", "Analysis completed")  # For VOICE
                    doctor_recommendations = ai_analysis.get("recommendations", "Recommendations unavailable")  # For TEXT
                else:
                    # Fallback for old format
                    doctor_detailed_analysis = str(ai_analysis)
                    doctor_recommendations = str(ai_analysis)
                    
            except concurrent.futures.TimeoutError:
                doctor_detailed_analysis = "Image analysis timeout - please try again with a clearer image"
                doctor_recommendations = "Image analysis timeout - please try again with a clearer image"
            except Exception as e:
                doctor_detailed_analysis = f"Image analysis error - please try again: {str(e)[:100]}"
                doctor_recommendations = f"Image analysis error - please try again: {str(e)[:100]}"
        
        print(f"🚀 FAST image analysis result - Detailed Analysis (Voice): {doctor_detailed_analysis[:100]}...")
        print(f"🚀 FAST image analysis result - Recommendations (Text): {doctor_recommendations[:100]}...")
        
        # Check if responses are different
        if doctor_detailed_analysis == doctor_recommendations:
            print("⚠️ WARNING: Both responses are identical - this should not happen!")
        else:
            print("✅ Responses are different - system working correctly")
        
    except Exception as e:
        print(f"❌ Critical error in process_audio_image: {e}")
        # Return emergency fallback response
        error_message = f"System error occurred. Please try again. Error: {str(e)[:100]}"
        return {
            "message": "Analysis completed with errors",
            "transcription": "Error in audio processing",
            "doctor_response": error_message,
            "detailed_analysis": error_message,
            "recommendations": error_message,
            "image_url": "error"
        }

    # Generate audio with cloud-optimized TTS
    print(f"🌐 Starting cloud TTS generation...")
    print(f"🎙️ Using free online TTS APIs for reliable voice generation")
    
    # Cloud TTS will automatically select the best available voice
    
    # IMMEDIATE TTS GENERATION (blocking but fast) - User gets audio with response
    print(f"🔊 Generating TTS immediately for better user experience...")
    output_audio = None
    audio_output_id = None
    
    try:
        # Quick TTS generation with 15-second limit
        import concurrent.futures
        
        def quick_tts_generation():
            # Use the detailed analysis for TTS (this is the doctor's voice response)
            return text_to_speech_with_elevenlabs(doctor_detailed_analysis)
        
        # Run TTS with timeout to ensure response isn't delayed too much
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(quick_tts_generation)
            try:
                output_audio = future.result(timeout=90)  # 90 second limit for model loading
                if output_audio:
                    audio_output_id = fs.put(output_audio, filename="doctor_response.mp3")
                    print(f"🔊 IMMEDIATE TTS completed and saved: {audio_output_id}")
                else:
                    print(f"🔊 TTS generation failed - proceeding without audio")
            except concurrent.futures.TimeoutError:
                print(f"🔊 TTS timeout after 90s - using fallback audio generation")
                # Try a quick fallback TTS method
                try:
                    from google_tts import generate_beep_audio
                    output_audio = generate_beep_audio(doctor_detailed_analysis[:100])
                    if output_audio:
                        audio_output_id = fs.put(output_audio, filename="fallback_response.wav")
                        print(f"🔊 Fallback audio generated and saved: {audio_output_id}")
                    else:
                        output_audio = None
                except Exception as fallback_error:
                    print(f"🔊 Fallback audio also failed: {fallback_error}")
                    output_audio = None
                
    except Exception as e:
        print(f"🔊 TTS error: {str(e)[:100]}")
        output_audio = None
    
    print(f"🔊 TTS processing completed - continuing with response")

    # SPEED OPTIMIZATION: Prepare response data first, save to DB in background
    base_url = os.environ.get("BASE_URL", "https://aihealthcheck-zzqr.onrender.com")
    
    response_data = {
        "message": "Analysis completed successfully",
        "transcription": transcription,
        "doctor_response": doctor_detailed_analysis,  # Detailed analysis for compatibility
        "detailed_analysis": doctor_detailed_analysis, # Detailed analysis (AI speaks this)
        "recommendations": doctor_recommendations,     # Recommendations (text only, no voice)
        "image_url": f"{base_url}/medibot/image/{image_id}"
    }
    
    # Add audio URL if available
    if audio_output_id:
        response_data["audio_url"] = f"{base_url}/medibot/audio/{audio_output_id}"
    
    # SPEED OPTIMIZATION: Save to database in background (non-blocking)
    def save_to_database():
        try:
            diagnosis = {
                "userEmail": current_user["email"],
                "imageFileId": str(image_id),
                "audioFileId": str(audio_id),
                "transcription": transcription,
                "doctorResponse": doctor_detailed_analysis,    # Detailed analysis for compatibility
                "detailedAnalysis": doctor_detailed_analysis, # Detailed analysis (AI speaks this)
                "recommendations": doctor_recommendations,    # Recommendations (text only)
                "audioOutputId": str(audio_output_id) if audio_output_id else None,
                "createdAt": datetime.datetime.utcnow()
            }
            diagnoses_collection.insert_one(diagnosis)
            print(f"🚀 Background database save completed")
        except Exception as e:
            print(f"⚠️ Background database save failed: {e}")
    
    # Start database save in background thread
    import threading
    db_thread = threading.Thread(target=save_to_database)
    db_thread.daemon = True
    db_thread.start()
    
    print(f"🚀 ULTRA-FAST process completed - returning response immediately")
    
    # Final safety check to ensure response is valid
    if not response_data.get("doctor_response"):
        response_data["doctor_response"] = "Analysis completed. Please check the image and try again if needed."
    
    if not response_data.get("detailed_analysis"):
        response_data["detailed_analysis"] = "Analysis completed. Please check the image and try again if needed."
        
    if not response_data.get("recommendations"):
        response_data["recommendations"] = "Recommendations unavailable. Please try again."
    
    if not response_data.get("transcription"):
        response_data["transcription"] = "Audio processing completed."
    
    print(f"🚀 Final response data: {len(response_data)} fields")
    print(f"🔍 Response fields: {list(response_data.keys())}")
    print(f"🔍 detailed_analysis length: {len(response_data.get('detailed_analysis', ''))}")
    print(f"🔍 recommendations length: {len(response_data.get('recommendations', ''))}")
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
@app.get("/test-response")
async def test_response():
    """Test endpoint to verify response structure"""
    from brain_of_the_doctor import generate_mock_medical_analysis
    result = generate_mock_medical_analysis("test")
    
    return {
        "detailed_analysis": result["detailed_analysis"],
        "recommendations": result["recommendations"],
        "detailed_analysis_length": len(result["detailed_analysis"]),
        "recommendations_length": len(result["recommendations"]),
        "are_different": result["detailed_analysis"] != result["recommendations"]
    }

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
    """Enhanced API status with TTS model information"""
    # Check TTS status with detailed information
    try:
        from simple_tts import _tts_ready, _tts_loading, _tts_instance
        if _tts_ready and _tts_instance:
            tts_status = "ready"
            tts_message = "✅ FastPitch model loaded and ready for high-quality voice"
            download_status = "completed"
        elif _tts_loading:
            tts_status = "loading"
            tts_message = "📥 FastPitch model downloading... (2-5 minutes on first run)"
            download_status = "in_progress"
        else:
            tts_status = "not_loaded"
            tts_message = "⏳ FastPitch model not yet initialized"
            download_status = "not_started"
    except ImportError:
        tts_status = "unavailable"
        tts_message = "❌ TTS module not available"
        download_status = "error"
    
    return {
        "status": "operational",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "tts": {
            "status": tts_status,
            "model": "tts_models/en/ljspeech/fast_pitch",
            "message": tts_message,
            "download_status": download_status,
            "cache_info": "Downloads once, then cached permanently",
            "voice_quality": "High-quality American English female (LJSpeech)"
        }
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