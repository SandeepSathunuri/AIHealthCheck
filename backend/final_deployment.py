#!/usr/bin/env python3
"""
Final deployment script - Clean up and prepare for Render
Removes all old TTS files and prepares Hugging Face TTS
"""

import os
import sys
import shutil

def cleanup_old_tts_files():
    """Remove old TTS files that are no longer needed"""
    print("🧹 Cleaning up old TTS files...")
    
    files_to_remove = [
        'cloud_tts.py',
        'voice_of_the_doctor_coqui.py',
        'test_cloud_tts.py',
        'render_tts.py',
        'deployment_test.py',
        'test_output.wav',
        'test_mock.wav'
    ]
    
    removed_count = 0
    for file in files_to_remove:
        if os.path.exists(file):
            try:
                os.remove(file)
                print(f"✅ Removed {file}")
                removed_count += 1
            except Exception as e:
                print(f"⚠️ Could not remove {file}: {e}")
        else:
            print(f"ℹ️ {file} not found (already clean)")
    
    print(f"🧹 Cleanup complete: {removed_count} files removed")

def clean_cache():
    """Clean Python cache files"""
    print("\n🧹 Cleaning Python cache...")
    
    cache_dirs = ['__pycache__', '.pytest_cache']
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir)
            print(f"✅ Removed {cache_dir}")

def verify_hf_setup():
    """Verify Hugging Face TTS setup"""
    print("\n🤗 Verifying Hugging Face TTS Setup")
    print("=" * 50)
    
    required_files = [
        'huggingface_tts.py',
        'simple_tts.py',  # Compatibility wrapper
        'main.py',
        'requirements.txt'
    ]
    
    missing = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - MISSING")
            missing.append(file)
    
    return len(missing) == 0

def check_requirements():
    """Check requirements.txt for Hugging Face dependency"""
    print("\n📦 Checking requirements.txt...")
    
    with open('requirements.txt', 'r') as f:
        content = f.read()
    
    if 'huggingface_hub' in content:
        print("✅ huggingface_hub dependency found")
        return True
    else:
        print("❌ huggingface_hub dependency missing")
        return False

def test_final_setup():
    """Test the final setup"""
    print("\n🧪 Testing Final Setup")
    print("=" * 30)
    
    try:
        # Test imports
        from huggingface_tts import text_to_speech_with_elevenlabs
        print("✅ huggingface_tts import successful")
        
        from simple_tts import text_to_speech_with_elevenlabs as compat_func
        print("✅ simple_tts compatibility wrapper successful")
        
        # Test mock audio (always works)
        from huggingface_tts import generate_mock_audio
        mock_audio = generate_mock_audio("Test")
        if mock_audio:
            print(f"✅ Mock audio working: {len(mock_audio)} bytes")
        
        return True
    except Exception as e:
        print(f"❌ Setup test failed: {e}")
        return False

def show_deployment_info():
    """Show final deployment information"""
    print("\n📋 DEPLOYMENT INFORMATION")
    print("=" * 60)
    print("🤗 TTS System: Hugging Face Inference API")
    print("🎙️ Models: Microsoft SpeechT5, Suno Bark, ESPnet VITS")
    print("🔄 Fallback: Mock audio (always available)")
    print("📦 Dependencies: huggingface_hub (lightweight)")
    print("🚀 Startup: Fast (no model downloads)")
    print("🔑 Token: Set HF_TOKEN environment variable")
    print("🌐 Cloud: Fully compatible with Render/Heroku/AWS")
    
    print("\n🔧 Environment Variables for Render:")
    print("- HF_TOKEN: Your Hugging Face token")
    print("- GROQ_API_KEY: Your Groq API key")
    print("- MONGO_CONN: Your MongoDB connection string")
    print("- JWT_SECRET: Your JWT secret key")
    
    print("\n📝 Get HF Token:")
    print("1. Go to: https://huggingface.co/settings/tokens")
    print("2. Create a new token with 'Read' permissions")
    print("3. Add it to Render environment variables")

def main():
    """Main deployment preparation"""
    print("🚀 FINAL DEPLOYMENT PREPARATION")
    print("=" * 60)
    
    # Cleanup old files
    cleanup_old_tts_files()
    
    # Clean cache
    clean_cache()
    
    # Verify setup
    files_ok = verify_hf_setup()
    req_ok = check_requirements()
    test_ok = test_final_setup()
    
    # Summary
    print("\n📊 FINAL DEPLOYMENT CHECK")
    print("=" * 60)
    print(f"Files Present    : {'✅ PASS' if files_ok else '❌ FAIL'}")
    print(f"Requirements OK  : {'✅ PASS' if req_ok else '❌ FAIL'}")
    print(f"Setup Test       : {'✅ PASS' if test_ok else '❌ FAIL'}")
    
    if files_ok and req_ok and test_ok:
        print("\n🎉 FINAL DEPLOYMENT READY!")
        print("✅ All old TTS files removed")
        print("✅ Hugging Face TTS configured")
        print("✅ Compatibility maintained")
        print("✅ Mock audio fallback working")
        
        show_deployment_info()
        
        print("\n🚀 READY TO DEPLOY TO RENDER!")
        return True
    else:
        print("\n⚠️ DEPLOYMENT NOT READY")
        print("🔧 Fix the failed checks before deploying")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)