import asyncpg
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """建立資料庫連接池"""
        try:
            self.pool = await asyncpg.create_pool(
                settings.database_url,
                min_size=5,
                max_size=10,
                command_timeout=60,
                server_settings={
                    'application_name': settings.app_name
                }
            )
            logger.info("✅ Connected to PostgreSQL database")
            
            # 測試連接
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow("SELECT NOW() as time, version() as version")
                logger.info(f"✅ Database query test successful: {result['time']}")
                
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    async def disconnect(self):
        """關閉資料庫連接池"""
        if self.pool:
            await self.pool.close()
            logger.info("✅ Database connection closed")
    
    async def execute(self, query: str, *args):
        """執行 SQL 命令"""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetch(self, query: str, *args):
        """執行查詢並返回多筆記錄"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)
    
    async def fetchrow(self, query: str, *args):
        """執行查詢並返回單筆記錄"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)
    
    async def fetchval(self, query: str, *args):
        """執行查詢並返回單個值"""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)


# 創建全局資料庫實例
db = Database()
