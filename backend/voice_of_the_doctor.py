# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Step 1b: ElevenLabs Setup with fallback
import os
import requests

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

def text_to_speech_with_elevenlabs(input_text, output_path=None):
    """
    Generates text-to-speech audio using ElevenLabs and returns the audio as bytes.
    Falls back to mock audio if ElevenLabs API fails.

    Args:
        input_text (str): The text to convert to speech.
        output_path (str, optional): Path to save the audio file. If None, only returns bytes.

    Returns:
        bytes: The audio data, or None if generation fails.
    """
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your-elevenlabs-api-key-here":
        print("⚠️ ElevenLabs API key not configured, using fallback")
        return generate_mock_audio(input_text, output_path)

    try:
        print(f"Generating audio for: {input_text}")

        # Use ElevenLabs API directly with requests
        url = f"https://api.elevenlabs.io/v1/text-to-speech/pMsXgVXv3BLzUgSXRplE"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": input_text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            audio_bytes = response.content
            print(f"✅ Audio generated successfully, size: {len(audio_bytes)} bytes")
            
            # Save to output_path if provided
            if output_path:
                with open(output_path, "wb") as f:
                    f.write(audio_bytes)
                print(f"✅ Audio saved to: {output_path}")
            
            return audio_bytes
        else:
            print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
            return generate_mock_audio(input_text, output_path)

    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        return generate_mock_audio(input_text, output_path)

def generate_mock_audio(input_text, output_path=None):
    """
    Generate a mock audio file when ElevenLabs is unavailable.
    Creates a simple audio file placeholder.
    """
    try:
        # Create a minimal MP3 header (silent audio)
        # This is a very basic MP3 file with silence
        mock_audio_data = b'\xff\xfb\x90\x00' + b'\x00' * 1000  # Basic MP3 header + silence
        
        print(f"✅ Generated mock audio for: {input_text[:50]}...")
        
        if output_path:
            with open(output_path, "wb") as f:
                f.write(mock_audio_data)
            print(f"✅ Mock audio saved to: {output_path}")
        
        return mock_audio_data
        
    except Exception as e:
        print(f"❌ Error generating mock audio: {e}")
        return b'\xff\xfb\x90\x00' + b'\x00' * 100  # Minimal fallback

# Example usage (optional)
if __name__ == "__main__":
    input_text = "Sandeep Nenu ninu premistuna"
    text_to_speech_with_elevenlabs(input_text, "elevenlabs_testing_autoplay.mp3")