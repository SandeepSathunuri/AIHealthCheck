import { API_ENDPOINTS } from '../config/api';

/**
 * Wake up the Render backend server to avoid cold start delays
 * This function pings the health endpoint when the app loads
 */
export const wakeUpBackend = async () => {
  try {
    console.log('🚀 Waking up backend server...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const startTime = Date.now();
    
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend is awake! Response time: ${responseTime}ms`, data);
      return { success: true, responseTime, data };
    } else {
      console.log(`⚠️ Backend responded with status: ${response.status}`);
      return { success: false, status: response.status, responseTime };
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Backend wake-up timeout (30s) - server may be cold starting');
    } else {
      console.log('❌ Backend wake-up failed:', error.message);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Preemptive backend warming - call this when user is likely to use the app
 */
export const preWarmBackend = async () => {
  try {
    // Fire and forget - don't wait for response
    fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Silently handle errors for pre-warming
    });
    
    console.log('🔥 Pre-warming backend...');
  } catch (error) {
    // Silently handle pre-warming errors
  }
};

export default { wakeUpBackend, preWarmBackend };