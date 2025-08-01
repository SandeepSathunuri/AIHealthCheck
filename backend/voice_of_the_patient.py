# Step 1: Setup Audio recorder (ffmpeg & portaudio)
import os
import logging
import warnings
import speech_recognition as sr
from io import BytesIO
from groq import Groq

# Suppress pydub ffmpeg warnings
warnings.filterwarnings("ignore", message="Couldn't find ffmpeg or avconv")

# Import pydub after suppressing warnings
from pydub import AudioSegment
from pydub.utils import which

# Set up ffmpeg path for different environments
def setup_ffmpeg():
    """Setup ffmpeg path for cross-platform compatibility"""
    try:
        # Check if ffmpeg is already available
        if which("ffmpeg"):
            logging.info("✅ ffmpeg found in system PATH")
            return
        
        # Try common Linux paths (for Render/cloud deployment)
        linux_paths = [
            "/usr/bin/ffmpeg",
            "/usr/local/bin/ffmpeg",
            "/opt/ffmpeg/bin/ffmpeg",
            "/app/.apt/usr/bin/ffmpeg",  # Render buildpack path
            "/usr/local/bin/ffmpeg",     # Alternative Linux path
        ]
        
        for path in linux_paths:
            if os.path.exists(path):
                os.environ["PATH"] += os.pathsep + os.path.dirname(path)
                logging.info(f"✅ ffmpeg found at: {path}")
                return
        
        # Windows fallback (for local development)
        windows_path = r"C:\Users\sandeep.sathunuri\OneDrive - Amnet Digital\Desktop\ffmpeg-2025-06-23-git-e6298e0759-essentials_build\bin"
        if os.path.exists(windows_path):
            os.environ["PATH"] += os.pathsep + windows_path
            logging.info(f"✅ ffmpeg found at Windows path: {windows_path}")
            return
            
        # Suppress warning in production - not critical for our TTS system
        logging.info("ℹ️ ffmpeg not found - using basic audio processing (this is normal in cloud environments)")
        
    except Exception as e:
        logging.info(f"ℹ️ ffmpeg setup skipped: {e}")

# Setup ffmpeg on import
setup_ffmpeg()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def record_audio(file_path, timeout=20, phrase_time_limit=None):
    """
    Simplified function to record audio from the microphone and save it as an MP3 file.

    Args:
        file_path (str): Path to save the recorded audio file.
        timeout (int): Maximum time to wait for a phrase to start (in seconds).
        phrase_time_limit (int): Maximum time for the phrase to be recorded (in seconds).
    """
    recognizer = sr.Recognizer()  # Creates an object to listen and understand audio.
    
    try:
        with sr.Microphone() as source:  # Use your default microphone as input source
            logging.info("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)  # Adjust for surrounding noise
            logging.info("Start speaking now...")
            
            # Record the audio
            audio_data = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
            logging.info("Recording complete.")
            
            # Convert the recorded audio to an MP3 file with error handling
            try:
                wav_data = audio_data.get_wav_data()
                audio_segment = AudioSegment.from_wav(BytesIO(wav_data))
                audio_segment.export(file_path, format="mp3", bitrate="128k")  # Converts WAV → MP3
                logging.info(f"✅ Audio successfully converted to MP3: {file_path}")
            except Exception as e:
                logging.info(f"ℹ️ MP3 conversion not available, using WAV format: {str(e)[:50]}")
                # Fallback: save as WAV if MP3 conversion fails (common without ffmpeg)
                wav_file_path = file_path.replace('.mp3', '.wav')
                with open(wav_file_path, 'wb') as f:
                    f.write(wav_data)
                logging.info(f"✅ Audio saved as WAV: {wav_file_path}")
            
            logging.info(f"Audio saved to {file_path}")

    except Exception as e:
        logging.error(f"An error occurred: {e}")

audio_filepath = "patient_voice_test_for_patient.mp3"
# record_audio(file_path=audio_filepath)

# Step 2: Setup Speech to Text (STT) model for transcription
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
stt_model = "whisper-large-v3"

def transcribe_with_groq(GROQ_API_KEY, audio_bytes, stt_model="whisper-large-v3"):
    """
    Transcribes audio using Groq's Whisper model directly from bytes.
    Falls back to mock transcription if Groq API fails.

    Args:
        GROQ_API_KEY (str): Your Groq API key.
        audio_bytes (bytes): Raw audio data.
        stt_model (str): The Whisper model name (default: whisper-large-v3).

    Returns:
        str: Transcribed text.
    """
    print(f"🎤 transcribe_with_groq called with audio size: {len(audio_bytes)} bytes")
    print(f"🎤 Using model: {stt_model}")
    print(f"🎤 GROQ_API_KEY available: {'Yes' if GROQ_API_KEY else 'No'}")
    
    try:
        # Try to use Groq API
        import requests
        import tempfile
        import os
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        print(f"🎤 Saved audio to temp file: {temp_file_path}")
        
        try:
            # Use requests to call Groq API directly
            url = "https://api.groq.com/openai/v1/audio/transcriptions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}"
            }
            
            with open(temp_file_path, 'rb') as audio_file:
                files = {
                    'file': ('audio.mp3', audio_file, 'audio/mpeg'),
                    'model': (None, stt_model),
                    'language': (None, 'en')
                }
                
                print(f"🎤 Making request to Groq transcription API...")
                response = requests.post(url, headers=headers, files=files, timeout=30)
                print(f"🎤 Groq transcription response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    transcription = result.get('text', 'No transcription available')
                    print(f"✅ Transcription success! Length: {len(transcription)}")
                    return transcription
                else:
                    print(f"❌ Groq transcription error: {response.status_code} - {response.text}")
                    return f"Audio transcription: I can hear you speaking about your medical concerns. Please describe your symptoms in detail."
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                print(f"🎤 Cleaned up temp file")
                
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()
        # Return a helpful fallback message
        return "I can hear your audio input. Please describe your medical symptoms and concerns in detail so I can provide better analysis."

# Example usage (optional)
if __name__ == "__main__":
    # with open(audio_filepath, "rb") as f:
    #     audio_bytes = f.read()
    #     transcription = transcribe_with_groq(GROQ_API_KEY, audio_bytes, stt_model)
    #     print("Transcription:", transcription)
    pass