"""
Compatibility wrapper for Hugging Face TTS
This file redirects all calls to the Hugging Face TTS system
"""

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🤗 SIMPLE_TTS.PY LOADED - Hugging Face TTS Compatibility Wrapper")

# Import everything from huggingface_tts
from huggingface_tts import (
    text_to_speech_with_elevenlabs,
    generate_mock_audio
)

# Compatibility functions for any legacy code
def text_to_speech_with_coqui_fast_pitch(input_text, output_path=None):
    """Legacy compatibility function - redirects to Hugging Face TTS"""
    logger.info("🔄 Legacy FastPitch call redirected to Hugging Face TTS")
    return text_to_speech_with_elevenlabs(input_text, output_path)

def get_fast_tts_instance():
    """Legacy compatibility function - no longer needed for Hugging Face TTS"""
    logger.info("🔄 Legacy TTS instance call - Hugging Face TTS doesn't need instances")
    return None

# Clear startup message
logger.info("✅ Hugging Face TTS compatibility wrapper ready")
print("🤗 Simple TTS -> Hugging Face TTS compatibility layer loaded")