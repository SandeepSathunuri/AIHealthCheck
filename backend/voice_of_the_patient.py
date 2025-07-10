# Step 1: Setup Audio recorder (ffmpeg & portaudio)
import os
import logging
import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO
from groq import Groq

os.environ["PATH"] += os.pathsep + r"C:\Users\sandeep.sathunuri\OneDrive - Amnet Digital\Desktop\ffmpeg-2025-06-23-git-e6298e0759-essentials_build\bin"

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
            recognizer.adjust_for_ambient_noise(source, duration=1)  # Mic lo surrounding noises ni ignore cheyyataniki adjust chestundi, for 1 second.
            logging.info("Start speaking now...")
            
            # Record the audio
            audio_data = recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
            logging.info("Recording complete.")
            
            # Convert the recorded audio to an MP3 file
            wav_data = audio_data.get_wav_data()
            audio_segment = AudioSegment.from_wav(BytesIO(wav_data))
            audio_segment.export(file_path, format="mp3", bitrate="128k")  # Converts WAV → MP3 and saves it to the given file_path
            
            logging.info(f"Audio saved to {file_path}")

    except Exception as e:
        logging.error(f"An error occurred: {e}")

audio_filepath = "patient_voice_test_for_patient.mp3"
# record_audio(file_path=audio_filepath)

# Step 2: Setup Speech to Text (STT) model for transcription
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
stt_model = "whisper-large-v3"

def transcribe_with_groq(GROQ_API_KEY, audio_filepath, stt_model="whisper-large-v3"):
    client = Groq(api_key=GROQ_API_KEY)
    
    with open(audio_filepath, "rb") as audio_file:  # Use context manager to ensure file closes
        transcription = client.audio.transcriptions.create(
            model=stt_model,
            file=audio_file,
            language="en"
        )

    return transcription.text
# print(transcribe_with_groq(GROQ_API_KEY, audio_filepath, stt_model))