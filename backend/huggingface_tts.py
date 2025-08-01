import os
import tempfile
import logging
import requests
import urllib.parse
from typing import Optional
from huggingface_hub import InferenceClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🤗 HUGGINGFACE_TTS.PY LOADED - Using HF Inference API")

def generate_mock_audio(input_text: str, output_path: Optional[str] = None) -> bytes:
    """Generate a mock audio file when TTS is unavailable."""
    try:
        logger.info(f"🔊 Generating mock audio for: {input_text[:50]}...")
        
        # Create a minimal WAV header for silence
        sample_rate = 22050
        duration = 3  # 3 seconds
        num_samples = sample_rate * duration
        
        # WAV header (44 bytes)
        wav_header = bytearray([
            # RIFF header
            0x52, 0x49, 0x46, 0x46,  # "RIFF"
            0x00, 0x00, 0x00, 0x00,  # File size (will be filled later)
            0x57, 0x41, 0x56, 0x45,  # "WAVE"
            
            # fmt chunk
            0x66, 0x6D, 0x74, 0x20,  # "fmt "
            0x10, 0x00, 0x00, 0x00,  # Chunk size (16)
            0x01, 0x00,              # Audio format (PCM)
            0x01, 0x00,              # Number of channels (mono)
            0x22, 0x56, 0x00, 0x00,  # Sample rate (22050)
            0x44, 0xAC, 0x00, 0x00,  # Byte rate
            0x02, 0x00,              # Block align
            0x10, 0x00,              # Bits per sample (16)
            
            # data chunk
            0x64, 0x61, 0x74, 0x61,  # "data"
            0x00, 0x00, 0x00, 0x00,  # Data size (will be filled later)
        ])
        
        # Generate silence (zeros)
        audio_data = bytearray(num_samples * 2)  # 2 bytes per sample (16-bit)
        
        # Fill in the file size and data size in the header
        file_size = len(wav_header) + len(audio_data) - 8
        data_size = len(audio_data)
        
        wav_header[4:8] = file_size.to_bytes(4, 'little')
        wav_header[40:44] = data_size.to_bytes(4, 'little')
        
        # Combine header and data
        mock_audio_data = bytes(wav_header + audio_data)
        
        logger.info(f"✅ Generated mock audio ({len(mock_audio_data)} bytes)")
        
        if output_path:
            with open(output_path, "wb") as f:
                f.write(mock_audio_data)
            logger.info(f"✅ Mock audio saved to: {output_path}")
        
        return mock_audio_data
        
    except Exception as e:
        logger.error(f"❌ Error generating mock audio: {e}")
        # Return minimal fallback
        return b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xAC\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

def text_to_speech_with_free_api(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Free TTS using Google Translate API (no token required)
    """
    try:
        logger.info(f"🌐 Free TTS requested for: {input_text[:50]}...")
        
        # Limit text length
        if len(input_text) > 500:
            input_text = input_text[:497] + "..."
        

        
        # Use Google Translate TTS endpoint (free, no API key needed)
        base_url = "https://translate.google.com/translate_tts"
        params = {
            'ie': 'UTF-8',
            'q': input_text,
            'tl': 'en',
            'client': 'tw-ob',
            'idx': '0',
            'total': '1',
            'textlen': str(len(input_text))
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        logger.info("🌐 Calling Google TTS API...")
        response = requests.get(base_url, params=params, headers=headers, timeout=30)
        
        if response.status_code == 200 and len(response.content) > 1000:
            logger.info(f"✅ Free TTS successful! Generated {len(response.content)} bytes")
            
            # Save to output_path if provided
            if output_path:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                logger.info(f"✅ Audio saved to: {output_path}")
            
            return response.content
        else:
            logger.warning(f"⚠️ Free TTS failed: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Free TTS error: {e}")
        return None

def text_to_speech_with_huggingface(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Text-to-speech using Hugging Face Inference API (requires HF_TOKEN)
    """
    try:
        logger.info(f"🤗 Hugging Face TTS requested for: {input_text[:50]}...")
        
        # Check for HF_TOKEN
        hf_token = os.environ.get("HF_TOKEN")
        if not hf_token:
            logger.warning("⚠️ HF_TOKEN not set - skipping Hugging Face TTS")
            return None
        
        # Limit text length for better performance
        if len(input_text) > 500:
            input_text = input_text[:497] + "..."
            logger.info("🔄 Text truncated to 500 characters for performance")
        
        # Initialize Hugging Face Inference Client
        logger.info("🤗 Initializing Hugging Face Inference Client...")
        client = InferenceClient(api_key=hf_token)
        
        # Try the most reliable model first
        try:
            logger.info("🎙️ Trying Hugging Face TTS model...")
            audio_bytes = client.text_to_speech(input_text)
            
            if audio_bytes and len(audio_bytes) > 1000:
                logger.info(f"✅ Hugging Face TTS successful! Generated {len(audio_bytes)} bytes")
                
                # Save to output_path if provided
                if output_path:
                    with open(output_path, "wb") as f:
                        f.write(audio_bytes)
                    logger.info(f"✅ Audio saved to: {output_path}")
                
                return audio_bytes
            else:
                logger.warning("⚠️ Hugging Face TTS returned small/no data")
                return None
                
        except Exception as model_error:
            logger.warning(f"⚠️ Hugging Face TTS failed: {model_error}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Hugging Face TTS error: {e}")
        return None

def text_to_speech_with_elevenlabs(input_text: str, output_path: Optional[str] = None, voice_preference: str = "auto") -> Optional[bytes]:
    """
    Main TTS function with multiple fallbacks:
    1. Hugging Face TTS (if HF_TOKEN available)
    2. Free Google TTS (no token required)
    3. Mock audio (always works)
    """
    logger.info(f"🎙️ TTS requested for: {input_text[:50]}...")
    
    # Try Hugging Face TTS first (if token available)
    if os.environ.get("HF_TOKEN"):
        logger.info("🤗 Trying Hugging Face TTS...")
        result = text_to_speech_with_huggingface(input_text, output_path)
        if result:
            logger.info("✅ Using Hugging Face TTS")
            return result
    else:
        logger.info("ℹ️ HF_TOKEN not available - skipping Hugging Face TTS")
    
    # Try free Google TTS
    logger.info("🌐 Trying free Google TTS...")
    result = text_to_speech_with_free_api(input_text, output_path)
    if result:
        logger.info("✅ Using free Google TTS")
        return result
    
    # Final fallback to mock audio
    logger.warning("🔊 All TTS services failed - using mock audio fallback")
    return generate_mock_audio(input_text, output_path)

# Example usage
if __name__ == "__main__":
    # Test with environment variable
    if not os.environ.get("HF_TOKEN"):
        print("⚠️ Please set HF_TOKEN environment variable")
        print("💡 Get your token from: https://huggingface.co/settings/tokens")
    else:
        test_text = "Hello, this is a test of the Hugging Face text-to-speech system for medical analysis."
        audio_data = text_to_speech_with_elevenlabs(test_text, "test_huggingface_tts.wav")
        if audio_data:
            print(f"✅ Generated {len(audio_data)} bytes of audio")
        else:
            print("❌ Failed to generate audio")