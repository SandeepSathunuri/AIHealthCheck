"""
Compatibility wrapper for Google TTS
This file redirects all calls to the Google TTS system
"""

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🌐 SIMPLE_TTS.PY LOADED - Google TTS Compatibility Wrapper")

# Import everything from google_tts
from google_tts import (
    text_to_speech_with_elevenlabs,
    generate_beep_audio as generate_mock_audio
)

# Compatibility functions for any legacy code
def text_to_speech_with_coqui_fast_pitch(input_text, output_path=None):
    """Legacy compatibility function - redirects to Google TTS"""
    logger.info("🔄 Legacy FastPitch call redirected to Google TTS")
    return text_to_speech_with_elevenlabs(input_text, output_path)

def get_fast_tts_instance():
    """Legacy compatibility function - no longer needed for Google TTS"""
    logger.info("🔄 Legacy TTS instance call - Google TTS doesn't need instances")
    return None

# Clear startup message
logger.info("✅ Google TTS compatibility wrapper ready")
print("🌐 Simple TTS -> Google TTS compatibility layer loaded")