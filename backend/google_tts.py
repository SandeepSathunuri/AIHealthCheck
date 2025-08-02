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
    """Generate a pleasant notification beep to indicate analysis completion."""
    try:
        logger.info(f"🔊 Generating completion beep for: {input_text[:50]}...")
        
        # Audio parameters for a pleasant notification sound
        sample_rate = 22050
        duration = 1.5  # 1.5 seconds
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
        
        # Generate a pleasant two-tone notification sound
        audio_data = bytearray()
        for i in range(num_samples):
            t = i / sample_rate
            
            # Two-tone notification: 800Hz then 1000Hz
            if t < 0.7:
                frequency = 800  # First tone
                fade = min(t * 6, 1.0, (0.7 - t) * 6)
            else:
                frequency = 1000  # Second tone (higher)
                fade = min((t - 0.7) * 6, 1.0, (duration - t) * 6)
            
            # Generate sine wave with fade
            amplitude = int(fade * 12000 * math.sin(2 * math.pi * frequency * t))
            
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
        
        logger.info(f"✅ Generated completion notification ({len(beep_audio_data)} bytes)")
        logger.info("🔊 Audio provides confirmation that medical analysis is complete")
        
        if output_path:
            with open(output_path, "wb") as f:
                f.write(beep_audio_data)
            logger.info(f"✅ Notification audio saved to: {output_path}")
        
        return beep_audio_data
        
    except Exception as e:
        logger.error(f"❌ Error generating notification audio: {e}")
        # Return minimal silent fallback
        return b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xAC\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

def text_to_speech_with_google(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Text-to-speech using Google Translate TTS API (optimized for speed)
    Uses only the working Google TTS Minimal endpoint
    """
    try:
        logger.info(f"🌐 Google TTS Minimal requested for: {input_text[:50]}...")
        
        # Limit text length for faster processing
        if len(input_text) > 200:
            input_text = input_text[:197] + "..."
        
        # Use only the working Google TTS Minimal configuration
        url = 'https://translate.google.com/translate_tts'
        params = {
            'ie': 'UTF-8',
            'q': input_text,
            'tl': 'en',
            'client': 'gtx'
        }
        headers = {
            'User-Agent': 'curl/7.68.0',
            'Accept': '*/*'
        }
        
        logger.info("🌐 Calling Google TTS Minimal (fast)...")
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200 and len(response.content) > 1000:
            logger.info(f"✅ Google TTS Minimal successful! Generated {len(response.content)} bytes")
            
            # Save to output_path if provided
            if output_path:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                logger.info(f"✅ Audio saved to: {output_path}")
            
            return response.content
        else:
            logger.warning(f"⚠️ Google TTS Minimal failed: {response.status_code}")
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

def text_to_speech_with_voicerss(input_text: str, output_path: Optional[str] = None) -> Optional[bytes]:
    """
    Alternative TTS using VoiceRSS free API
    """
    try:
        logger.info(f"🎙️ VoiceRSS TTS requested for: {input_text[:50]}...")
        
        # Limit text length
        if len(input_text) > 300:
            input_text = input_text[:297] + "..."
        
        # VoiceRSS free API endpoint
        url = "http://api.voicerss.org/"
        
        params = {
            'key': 'undefined',  # Free tier
            'hl': 'en-us',
            'src': input_text,
            'r': '0',
            'c': 'mp3',
            'f': '44khz_16bit_stereo'
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Accept': 'audio/*'
        }
        
        logger.info("🎙️ Calling VoiceRSS API...")
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200 and len(response.content) > 1000:
            logger.info(f"✅ VoiceRSS successful! Generated {len(response.content)} bytes")
            
            # Save to output_path if provided
            if output_path:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                logger.info(f"✅ Audio saved to: {output_path}")
            
            return response.content
        else:
            logger.warning(f"⚠️ VoiceRSS failed: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"❌ VoiceRSS error: {e}")
        return None

def text_to_speech_with_elevenlabs(input_text: str, output_path: Optional[str] = None, voice_preference: str = "google") -> Optional[bytes]:
    """
    Optimized TTS function - uses only Google TTS Minimal for speed
    """
    logger.info(f"🎙️ Fast TTS requested for: {input_text[:50]}...")
    
    # Use only Google TTS Minimal (the one that works)
    result = text_to_speech_with_google(input_text, output_path)
    if result:
        logger.info("✅ Using Google TTS Minimal")
        return result
    
    # If Google TTS fails, use beep audio as fallback
    logger.warning("🔊 Google TTS failed - using audible beep fallback")
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