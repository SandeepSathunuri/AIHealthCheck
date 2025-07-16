# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Step 1b: ElevenLabs Setup
from elevenlabs import ElevenLabs
import os

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

def text_to_speech_with_elevenlabs(input_text, output_path=None):
    """
    Generates text-to-speech audio using ElevenLabs and returns the audio as bytes.
    If output_path is provided, saves the audio to that file.

    Args:
        input_text (str): The text to convert to speech.
        output_path (str, optional): Path to save the audio file. If None, only returns bytes.

    Returns:
        bytes: The audio data, or None if generation fails.
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("Missing ELEVENLABS_API_KEY in environment.")

    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    try:
        print(f"Generating audio for: {input_text}")

        # Generate audio
        audio_generator = client.text_to_speech.convert(
            voice_id="pMsXgVXv3BLzUgSXRplE",
            output_format="mp3_22050_32",
            text=input_text,
            model_id="eleven_turbo_v2"
        )

        # Collect all chunks into a single bytes object
        audio_bytes = b""
        for chunk in audio_generator:
            audio_bytes += chunk

        print(f"✅ Audio generated successfully, total size: {len(audio_bytes)} bytes")

        # Save to output_path if provided
        if output_path:
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            print(f"✅ Audio saved to: {output_path}")

        return audio_bytes

    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        return None

# Example usage (optional)
if __name__ == "__main__":
    input_text = "Sandeep Nenu ninu premistuna"
    text_to_speech_with_elevenlabs(input_text, "elevenlabs_testing_autoplay.mp3")