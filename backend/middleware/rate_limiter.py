"""
Enterprise Rate Limiting Middleware
"""
import time
import redis
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, Optional
import json
import hashlib

class RateLimiter:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
        except:
            # Fallback to in-memory storage for development
            self.redis_client = None
            self.memory_store: Dict[str, Dict] = {}
    
    def _get_client_id(self, request: Request) -> str:
        """Generate unique client identifier"""
        # Use IP + User-Agent for anonymous users, user_id for authenticated
        user_id = getattr(request.state, 'user_id', None)
        if user_id:
            return f"user:{user_id}"
        
        ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        client_hash = hashlib.md5(f"{ip}:{user_agent}".encode()).hexdigest()
        return f"anon:{client_hash}"
    
    def _get_rate_limit_key(self, client_id: str, window: str) -> str:
        return f"rate_limit:{client_id}:{window}"
    
    def check_rate_limit(
        self, 
        request: Request, 
        max_requests: int, 
        window_seconds: int,
        endpoint: str = "general"
    ) -> bool:
        """Check if request is within rate limits"""
        client_id = self._get_client_id(request)
        current_time = int(time.time())
        window_start = current_time - (current_time % window_seconds)
        
        key = f"{self._get_rate_limit_key(client_id, str(window_start))}:{endpoint}"
        
        if self.redis_client:
            try:
                current_count = self.redis_client.incr(key)
                if current_count == 1:
                    self.redis_client.expire(key, window_seconds)
                return current_count <= max_requests
            except:
                pass
        
        # Fallback to memory store
        if key not in self.memory_store:
            self.memory_store[key] = {"count": 0, "expires": window_start + window_seconds}
        
        # Clean expired entries
        if self.memory_store[key]["expires"] < current_time:
            self.memory_store[key] = {"count": 0, "expires": window_start + window_seconds}
        
        self.memory_store[key]["count"] += 1
        return self.memory_store[key]["count"] <= max_requests
    
    def get_rate_limit_info(self, request: Request, endpoint: str = "general") -> Dict:
        """Get current rate limit status"""
        client_id = self._get_client_id(request)
        current_time = int(time.time())
        window_start = current_time - (current_time % 60)  # 1-minute window
        
        key = f"{self._get_rate_limit_key(client_id, str(window_start))}:{endpoint}"
        
        if self.redis_client:
            try:
                current_count = int(self.redis_client.get(key) or 0)
                ttl = self.redis_client.ttl(key)
                return {
                    "requests_made": current_count,
                    "requests_remaining": max(0, 60 - current_count),
                    "reset_time": current_time + ttl if ttl > 0 else current_time + 60
                }
            except:
                pass
        
        # Fallback
        if key in self.memory_store:
            count = self.memory_store[key]["count"]
            return {
                "requests_made": count,
                "requests_remaining": max(0, 60 - count),
                "reset_time": self.memory_store[key]["expires"]
            }
        
        return {
            "requests_made": 0,
            "requests_remaining": 60,
            "reset_time": current_time + 60
        }

# Global rate limiter instance
rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/metrics"]:
        return await call_next(request)
    
    # Different limits for different endpoints
    endpoint_limits = {
        "/medibot/process": (10, 60),  # 10 requests per minute for AI processing
        "/auth/login": (5, 300),       # 5 login attempts per 5 minutes
        "/auth/signup": (3, 300),      # 3 signup attempts per 5 minutes
    }
    
    max_requests, window = endpoint_limits.get(request.url.path, (60, 60))
    
    if not rate_limiter.check_rate_limit(request, max_requests, window, request.url.path):
        rate_info = rate_limiter.get_rate_limit_info(request, request.url.path)
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Try again in {rate_info['reset_time'] - int(time.time())} seconds",
                "rate_limit_info": rate_info
            },
            headers={
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Remaining": str(rate_info["requests_remaining"]),
                "X-RateLimit-Reset": str(rate_info["reset_time"]),
                "Retry-After": str(rate_info["reset_time"] - int(time.time()))
            }
        )
    
    response = await call_next(request)
    
    # Add rate limit headers to response
    rate_info = rate_limiter.get_rate_limit_info(request, request.url.path)
    response.headers["X-RateLimit-Limit"] = str(max_requests)
    response.headers["X-RateLimit-Remaining"] = str(rate_info["requests_remaining"])
    response.headers["X-RateLimit-Reset"] = str(rate_info["reset_time"])
    
    return response