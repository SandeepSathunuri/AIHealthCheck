import os
import tempfile
import logging
import requests
import math
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🌐 GOOGLE_TTS.PY LOADED - Simple Google TTS + Beep Fallback")

def generate_beep_audio(input_text: str, output_path: Optional[str] = None) -> bytes:
    """Generate a simple beep audio to indicate TTS completion."""
    try:
        logger.info(f"🔊 Generating beep audio for: {input_text[:50]}...")
        
        # Audio parameters
        sample_rate = 22050
        duration = 2  # 2 seconds
        frequency = 800  # 800 Hz beep
        num_samples = int(sample_rate * duration)
        
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
        
        # Generate beep sound (sine wave)
        audio_data = bytearray()
        for i in range(num_samples):
            # Create a sine wave that fades in and out
            t = i / sample_rate
            fade = min(t * 4, 1.0, (duration - t) * 4)  # Fade in/out
            amplitude = int(fade * 16000 * math.sin(2 * math.pi * frequency * t))
            
            # Convert to 16-bit signed integer (little endian)
            sample = max(-32768, min(32767, amplitude))
            audio_data.extend(sample.to_bytes(2, 'little', signed=True))
        
        # Fill in the file size and data size in the header
        file_size = len(wav_header) + len(audio_data) - 8
        data_size = len(audio_data)
        
        wav_header[4:8] = file_size.to_bytes(4, 'little')
        wav_header[40:44] = data_size.to_bytes(4, 'little')
        
        # Combine header and data
        beep_audio_data = bytes(wav_header + audio_data)
        
        logger.info(f"✅ Generated beep audio ({len(beep_audio_data)} bytes)")
        
        if output_path:
            with open(output_path, "wb") as f:
                f.write(beep_audio_data)
            logger.info(f"✅ Beep audio saved to: {output_path}")
        
        return beep_audio_data
        
    except Exception as e:
        logger.error(f"❌ Error generating beep audio: {e}")
        # Return minimal silent fallback
        return b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xAC\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

def text_to_speech_with_google(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Text-to-speech using Google Translate TTS API (free, no token required)
    """
    try:
        logger.info(f"🌐 Google TTS requested for: {input_text[:50]}...")
        
        # Limit text length
        if len(input_text) > 500:
            input_text = input_text[:497] + "..."
        
        # Try multiple Google TTS endpoints for better reliability
        services = [
            {
                'name': 'Google TTS Primary',
                'url': 'https://translate.google.com/translate_tts',
                'params': {
                    'ie': 'UTF-8',
                    'q': input_text,
                    'tl': 'en',
                    'client': 'tw-ob',
                    'idx': '0',
                    'total': '1',
                    'textlen': str(len(input_text))
                },
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://translate.google.com/',
                    'Accept': 'audio/mpeg, audio/*',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            },
            {
                'name': 'Google TTS Alternative',
                'url': 'https://translate.google.com/translate_tts',
                'params': {
                    'ie': 'UTF-8',
                    'q': input_text,
                    'tl': 'en-us',
                    'client': 'gtx',
                    'idx': '0',
                    'total': '1'
                },
                'headers': {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': '*/*'
                }
            }
        ]
        
        for service in services:
            try:
                logger.info(f"🌐 Trying {service['name']}...")
                response = requests.get(
                    service['url'], 
                    params=service['params'], 
                    headers=service['headers'], 
                    timeout=15
                )
                
                if response.status_code == 200 and len(response.content) > 1000:
                    logger.info(f"✅ {service['name']} successful! Generated {len(response.content)} bytes")
                    
                    # Save to output_path if provided
                    if output_path:
                        with open(output_path, "wb") as f:
                            f.write(response.content)
                        logger.info(f"✅ Audio saved to: {output_path}")
                    
                    return response.content
                else:
                    logger.warning(f"⚠️ {service['name']} failed: {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"⚠️ {service['name']} error: {e}")
                continue
        
        # If we get here, all services failed
        logger.warning("⚠️ All Google TTS services failed")
        return None
            
    except Exception as e:
        logger.error(f"❌ Google TTS error: {e}")
        return None

def text_to_speech_with_pyttsx3(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Local TTS using pyttsx3 (system voices) as backup
    """
    try:
        logger.info(f"🔊 pyttsx3 TTS requested for: {input_text[:50]}...")
        
        import pyttsx3
        
        # Initialize the TTS engine
        engine = pyttsx3.init()
        
        # Set properties for better quality
        engine.setProperty('rate', 150)    # Speed
        engine.setProperty('volume', 0.9)  # Volume
        
        # Try to select a female voice
        voices = engine.getProperty('voices')
        if voices:
            for voice in voices:
                if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_audio_path = temp_file.name
        
        # Save to file
        engine.save_to_file(input_text, temp_audio_path)
        engine.runAndWait()
        
        # Read the generated audio file
        if os.path.exists(temp_audio_path):
            with open(temp_audio_path, 'rb') as audio_file:
                audio_bytes = audio_file.read()
            
            # Clean up temporary file
            os.unlink(temp_audio_path)
            
            if len(audio_bytes) > 1000:
                logger.info(f"✅ pyttsx3 TTS successful! Generated {len(audio_bytes)} bytes")
                
                # Save to output_path if provided
                if output_path:
                    with open(output_path, "wb") as f:
                        f.write(audio_bytes)
                    logger.info(f"✅ Audio saved to: {output_path}")
                
                return audio_bytes
            else:
                logger.warning("⚠️ pyttsx3 generated small file")
                return None
        else:
            logger.warning("⚠️ pyttsx3 did not generate audio file")
            return None
            
    except ImportError:
        logger.warning("⚠️ pyttsx3 not available")
        return None
    except Exception as e:
        logger.error(f"❌ pyttsx3 TTS error: {e}")
        return None

def text_to_speech_with_elevenlabs(input_text: str, output_path: Optional[str] = None, voice_preference: str = "google") -> Optional[bytes]:
    """
    Main TTS function with simple fallbacks:
    1. Google TTS (free, high quality)
    2. pyttsx3 local TTS (system voices)
    3. Beep audio (audible confirmation)
    """
    logger.info(f"🎙️ TTS requested for: {input_text[:50]}...")
    
    # Try Google TTS first
    logger.info("🌐 Trying Google TTS...")
    result = text_to_speech_with_google(input_text, output_path)
    if result:
        logger.info("✅ Using Google TTS")
        return result
    
    # Try pyttsx3 local TTS
    logger.info("🔊 Trying pyttsx3 local TTS...")
    result = text_to_speech_with_pyttsx3(input_text, output_path)
    if result:
        logger.info("✅ Using pyttsx3 local TTS")
        return result
    
    # Final fallback to beep audio (audible)
    logger.warning("🔊 All TTS services failed - using audible beep fallback")
    return generate_beep_audio(input_text, output_path)

# Compatibility alias
generate_mock_audio = generate_beep_audio

# Example usage
if __name__ == "__main__":
    test_text = "Hello, this is a test of the Google text-to-speech system for medical analysis."
    audio_data = text_to_speech_with_elevenlabs(test_text, "test_google_tts.mp3")
    if audio_data:
        print(f"✅ Generated {len(audio_data)} bytes of audio")
    else:
        print("❌ Failed to generate audio")