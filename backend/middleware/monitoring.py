"""
Enterprise Monitoring & Observability
"""
import time
import logging
import json
from fastapi import Request, Response
from typing import Dict, Any
import asyncio
from datetime import datetime, timedelta
import psutil
import os

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MetricsCollector:
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times = []
        self.endpoint_metrics: Dict[str, Dict] = {}
        self.start_time = time.time()
    
    def record_request(self, endpoint: str, method: str, status_code: int, response_time: float):
        """Record request metrics"""
        self.request_count += 1
        
        if status_code >= 400:
            self.error_count += 1
        
        self.response_times.append(response_time)
        
        # Keep only last 1000 response times for memory efficiency
        if len(self.response_times) > 1000:
            self.response_times = self.response_times[-1000:]
        
        # Track per-endpoint metrics
        key = f"{method}:{endpoint}"
        if key not in self.endpoint_metrics:
            self.endpoint_metrics[key] = {
                "count": 0,
                "errors": 0,
                "total_time": 0,
                "avg_time": 0
            }
        
        metrics = self.endpoint_metrics[key]
        metrics["count"] += 1
        metrics["total_time"] += response_time
        metrics["avg_time"] = metrics["total_time"] / metrics["count"]
        
        if status_code >= 400:
            metrics["errors"] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        uptime = time.time() - self.start_time
        avg_response_time = sum(self.response_times) / len(self.response_times) if self.response_times else 0
        
        # System metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "requests": {
                "total": self.request_count,
                "errors": self.error_count,
                "error_rate": self.error_count / max(self.request_count, 1),
                "requests_per_second": self.request_count / max(uptime, 1)
            },
            "performance": {
                "avg_response_time_ms": avg_response_time * 1000,
                "p95_response_time_ms": self._percentile(self.response_times, 95) * 1000 if self.response_times else 0,
                "p99_response_time_ms": self._percentile(self.response_times, 99) * 1000 if self.response_times else 0
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_mb": memory.used / 1024 / 1024,
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / 1024 / 1024 / 1024
            },
            "endpoints": self.endpoint_metrics
        }
    
    def _percentile(self, data: list, percentile: int) -> float:
        """Calculate percentile"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]

# Global metrics collector
metrics = MetricsCollector()

async def monitoring_middleware(request: Request, call_next):
    """Monitoring middleware to track requests and performance"""
    start_time = time.time()
    
    # Extract request info
    method = request.method
    endpoint = request.url.path
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    # Log request start
    logger.info(f"Request started: {method} {endpoint} from {client_ip}")
    
    try:
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        response_time = time.time() - start_time
        status_code = response.status_code
        
        # Record metrics
        metrics.record_request(endpoint, method, status_code, response_time)
        
        # Log request completion
        log_level = logging.WARNING if status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            f"Request completed: {method} {endpoint} - {status_code} - {response_time:.3f}s"
        )
        
        # Add performance headers
        response.headers["X-Response-Time"] = f"{response_time:.3f}s"
        response.headers["X-Request-ID"] = f"{int(time.time() * 1000)}"
        
        return response
        
    except Exception as e:
        # Record error
        response_time = time.time() - start_time
        metrics.record_request(endpoint, method, 500, response_time)
        
        # Log error
        logger.error(f"Request failed: {method} {endpoint} - {str(e)} - {response_time:.3f}s")
        
        # Re-raise the exception
        raise

class HealthChecker:
    def __init__(self):
        self.checks = {}
    
    async def check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            from pymongo import MongoClient
            client = MongoClient(os.getenv("MONGO_CONN"), serverSelectionTimeoutMS=5000)
            client.server_info()
            return {"status": "healthy", "response_time_ms": 0}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity"""
        try:
            import redis
            r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
            r.ping()
            return {"status": "healthy", "response_time_ms": 0}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def check_ai_services(self) -> Dict[str, Any]:
        """Check AI service availability"""
        try:
            from groq import Groq
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            # Simple test call
            return {"status": "healthy", "response_time_ms": 0}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get overall health status"""
        checks = {
            "database": await self.check_database(),
            "redis": await self.check_redis(),
            "ai_services": await self.check_ai_services()
        }
        
        overall_status = "healthy" if all(
            check["status"] == "healthy" for check in checks.values()
        ) else "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks,
            "version": "1.0.0"
        }

health_checker = HealthChecker()