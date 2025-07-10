# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Step 1a: gTTS Setup (optional)
import os
from gtts import gTTS

def text_to_speech_with_gtts_old(input_text, output_filepath):
    language = "en"
    audioobj = gTTS(text=input_text, lang=language, slow=False)
    audioobj.save(output_filepath)

# Step 1b: ElevenLabs Setup
from elevenlabs import ElevenLabs
from elevenlabs.client import ElevenLabs

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

def text_to_speech_with_elevenlabs_old(input_text, output_filepath):
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    try:
        audio = client.text_to_speech.convert(
            voice_id="pMsXgVXv3BLzUgSXRplE",
            output_format="mp3_22050_32",
            text=input_text,
            model_id="eleven_turbo_v2"
        )
        with open(output_filepath, "wb") as f:
            for chunk in audio:
                f.write(chunk)
    except Exception as e:
        print(f"An error occurred while generating or saving audio: {e}")

# ✅ Step 2: Playback using playsound (no temp file issues)
from playsound import playsound

def safe_play_audio(mp3_filepath):
    try:
        playsound(mp3_filepath)
    except Exception as e:
        print(f"Playback error: {e}")

# Combined usage
def text_to_speech_with_elevenlabs(input_text, output_filepath):
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    try:
        print(f"Generating audio for: {input_text}")
        print("Saving to:", os.path.abspath(output_filepath))

        audio = client.text_to_speech.convert(
            voice_id="pMsXgVXv3BLzUgSXRplE",
            output_format="mp3_22050_32",
            text=input_text,
            model_id="eleven_turbo_v2"
        )

        chunk_count = 0
        with open(output_filepath, "wb") as f:
            for chunk in audio:
                chunk_count += 1
                f.write(chunk)

        print(f"✅ File written with {chunk_count} chunks")

        if chunk_count == 0:
            print("⚠️ No audio chunks returned — check ElevenLabs config")

        # Play only if file is saved
        if chunk_count > 0:
            safe_play_audio(output_filepath)

    except Exception as e:
        print(f"An error occurred while generating or playing audio: {e}")

input_text="Sandeep Nenu ninu premistuna"
# text_to_speech_with_elevenlabs(input_text,"elevenlabs_testing_autoplay.mp3")
