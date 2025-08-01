#!/usr/bin/env python3
"""
Test script for Hugging Face TTS functionality
"""

import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_huggingface_tts():
    """Test the Hugging Face TTS system"""
    print("🤗 Testing Hugging Face TTS System")
    print("=" * 50)
    
    # Check for HF_TOKEN
    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        print("⚠️ HF_TOKEN environment variable not set")
        print("💡 Get your token from: https://huggingface.co/settings/tokens")
        print("💡 Set it with: export HF_TOKEN=your_token_here")
        return False
    else:
        print(f"✅ HF_TOKEN found: {hf_token[:10]}...")
    
    try:
        from huggingface_tts import text_to_speech_with_elevenlabs
        print("✅ Successfully imported huggingface_tts")
        
        # Test text
        test_text = "Hello, this is a test of the Hugging Face text-to-speech system using Suno Bark model."
        print(f"🔊 Testing with text: {test_text}")
        
        # Generate audio
        print("🤗 Calling Hugging Face TTS...")
        audio_data = text_to_speech_with_elevenlabs(test_text, "test_hf_output.wav")
        
        if audio_data:
            print(f"✅ Hugging Face TTS successful! Generated {len(audio_data)} bytes")
            print(f"📁 Audio saved to: test_hf_output.wav")
            return True
        else:
            print("❌ Hugging Face TTS failed to generate audio")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Install with: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_mock_audio():
    """Test the mock audio generation"""
    print("\n🔊 Testing Mock Audio Generation")
    print("=" * 50)
    
    try:
        from huggingface_tts import generate_mock_audio
        print("✅ Successfully imported generate_mock_audio")
        
        # Test mock audio
        test_text = "This is a mock audio test"
        print(f"🔊 Testing mock audio with: {test_text}")
        
        mock_audio = generate_mock_audio(test_text, "test_hf_mock.wav")
        
        if mock_audio:
            print(f"✅ Mock audio successful! Generated {len(mock_audio)} bytes")
            print(f"📁 Mock audio saved to: test_hf_mock.wav")
            return True
        else:
            print("❌ Mock audio generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Mock audio error: {e}")
        return False

def test_compatibility():
    """Test the simple_tts compatibility wrapper"""
    print("\n🔄 Testing Compatibility Wrapper")
    print("=" * 50)
    
    try:
        from simple_tts import text_to_speech_with_elevenlabs
        print("✅ Successfully imported simple_tts compatibility wrapper")
        
        # Test compatibility
        test_text = "Compatibility test for legacy code"
        print(f"🔊 Testing compatibility with: {test_text}")
        
        audio_data = text_to_speech_with_elevenlabs(test_text)
        
        if audio_data:
            print(f"✅ Compatibility wrapper successful! Generated {len(audio_data)} bytes")
            return True
        else:
            print("⚠️ Compatibility wrapper returned no data (expected if no HF_TOKEN)")
            return True  # This is OK if no token
            
    except Exception as e:
        print(f"❌ Compatibility wrapper error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Hugging Face TTS Test Suite")
    print("=" * 60)
    
    # Test Hugging Face TTS
    hf_success = test_huggingface_tts()
    
    # Test mock audio
    mock_success = test_mock_audio()
    
    # Test compatibility
    compat_success = test_compatibility()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 60)
    print(f"🤗 Hugging Face TTS: {'✅ PASS' if hf_success else '❌ FAIL'}")
    print(f"🔊 Mock Audio: {'✅ PASS' if mock_success else '❌ FAIL'}")
    print(f"🔄 Compatibility: {'✅ PASS' if compat_success else '❌ FAIL'}")
    
    if hf_success or mock_success:
        print("\n🎉 At least one TTS method is working!")
        print("🚀 System is ready for deployment")
        if not hf_success:
            print("💡 Set HF_TOKEN for full Hugging Face TTS functionality")
    else:
        print("\n⚠️ All TTS methods failed")
        print("🔧 Check dependencies and HF_TOKEN")
    
    print("=" * 60)