#!/bin/bash

echo "🚀 Starting Render build process..."

# Install system dependencies
echo "📦 Installing system packages..."
apt-get update
apt-get install -y espeak espeak-data festival festvox-kallpc16k alsa-utils libsndfile1-dev ffmpeg

# Install Python dependencies
echo "🐍 Installing Python packages..."
pip install -r requirements.txt

# Test TTS availability
echo "🔊 Testing TTS systems..."
espeak --version || echo "⚠️ espeak not available"
festival --version || echo "⚠️ festival not available"

# Pre-download a lightweight TTS model if possible
echo "📥 Attempting to pre-download TTS model..."
python3 -c "
try:
    from TTS.api import TTS
    print('🎙️ Downloading lightweight TTS model...')
    tts = TTS(model_name='tts_models/en/ljspeech/tacotron2-DDC', progress_bar=True, gpu=False)
    print('✅ TTS model downloaded successfully!')
except Exception as e:
    print(f'⚠️ TTS model download failed: {e}')
    print('🔄 Will use fallback TTS methods')
"

echo "✅ Render build complete!"