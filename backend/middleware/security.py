"""
Enterprise Security Middleware
"""
import time
import hashlib
import hmac
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Set
import re
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self):
        self.blocked_ips: Set[str] = set()
        self.suspicious_patterns = [
            r'<script[^>]*>.*?</script>',  # XSS
            r'union\s+select',             # SQL Injection
            r'drop\s+table',               # SQL Injection
            r'exec\s*\(',                  # Code injection
            r'eval\s*\(',                  # Code injection
        ]
        self.max_request_size = 50 * 1024 * 1024  # 50MB
    
    def is_ip_blocked(self, ip: str) -> bool:
        return ip in self.blocked_ips
    
    def block_ip(self, ip: str):
        self.blocked_ips.add(ip)
        logger.warning(f"Blocked IP: {ip}")
    
    def check_malicious_patterns(self, content: str) -> bool:
        """Check for common attack patterns"""
        content_lower = content.lower()
        for pattern in self.suspicious_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                return True
        return False
    
    def validate_content_type(self, request: Request) -> bool:
        """Validate content type for file uploads"""
        content_type = request.headers.get("content-type", "")
        
        if request.url.path.startswith("/medibot/process"):
            # Only allow multipart/form-data for file uploads
            return content_type.startswith("multipart/form-data")
        
        return True
    
    def check_request_size(self, request: Request) -> bool:
        """Check request size limits"""
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_request_size:
            return False
        return True

security = SecurityMiddleware()

async def security_middleware(request: Request, call_next):
    """Security middleware for request validation"""
    client_ip = request.client.host
    
    # Check if IP is blocked
    if security.is_ip_blocked(client_ip):
        logger.warning(f"Blocked request from IP: {client_ip}")
        return JSONResponse(
            status_code=403,
            content={"error": "Access denied", "message": "Your IP has been blocked"}
        )
    
    # Check request size
    if not security.check_request_size(request):
        logger.warning(f"Request too large from IP: {client_ip}")
        return JSONResponse(
            status_code=413,
            content={"error": "Request too large", "message": "Request exceeds maximum size limit"}
        )
    
    # Validate content type for specific endpoints
    if not security.validate_content_type(request):
        logger.warning(f"Invalid content type from IP: {client_ip}")
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid content type", "message": "Unsupported content type for this endpoint"}
        )
    
    # Add security headers
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    
    return response

async def input_validation_middleware(request: Request, call_next):
    """Validate input for malicious content"""
    # Skip for file uploads and GET requests
    if request.method in ["GET", "OPTIONS"] or request.url.path.startswith("/medibot/process"):
        return await call_next(request)
    
    try:
        # Check query parameters
        for key, value in request.query_params.items():
            if security.check_malicious_patterns(str(value)):
                logger.warning(f"Malicious pattern detected in query param {key}: {value}")
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid input", "message": "Malicious content detected"}
                )
        
        # For JSON requests, check body content
        if request.headers.get("content-type", "").startswith("application/json"):
            body = await request.body()
            if body and security.check_malicious_patterns(body.decode('utf-8', errors='ignore')):
                logger.warning("Malicious pattern detected in request body")
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid input", "message": "Malicious content detected"}
                )
    
    except Exception as e:
        logger.error(f"Error in input validation: {e}")
    
    return await call_next(request)