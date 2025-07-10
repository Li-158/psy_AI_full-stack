import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from app.config import settings
from app.database import db
from app.routers import auth, participants, projects, subprojects, users, researchers
from app.schemas import HealthCheck

# 配置日誌
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    # 啟動時執行
    logger.info("🚀 Starting Psychology Lab API")
    try:
        await db.connect()
        logger.info("✅ Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise
    
    yield
    
    # 關閉時執行
    logger.info("🛑 Shutting down Psychology Lab API")
    await db.disconnect()


# 創建 FastAPI 應用程式
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Psychology Lab Management System API",
    lifespan=lifespan
)

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(auth.router)
app.include_router(participants.router)
app.include_router(projects.router)
app.include_router(subprojects.router)
app.include_router(users.router)
app.include_router(researchers.router)


@app.get("/")
async def root():
    """根路由"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "timestamp": datetime.utcnow()
    }


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """健康檢查端點"""
    try:
        # 測試資料庫連接
        db_time = await db.fetchval("SELECT NOW()")
        
        return HealthCheck(
            status="healthy",
            database="connected",
            timestamp=datetime.utcnow(),
            database_time=db_time,
            server_info=f"{settings.app_name} v{settings.app_version}"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content=HealthCheck(
                status="unhealthy",
                database="disconnected",
                timestamp=datetime.utcnow(),
                error=str(e)
            ).dict()
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
