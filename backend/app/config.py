from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # 資料庫設定
    database_url: str
    
    # JWT 設定
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # 應用程式設定
    app_name: str = "Psychology Lab API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # 伺服器設定
    host: str = "0.0.0.0"
    port: int = 3001
    
    # CORS 設定
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        
    @property
    def cors_origins_list(self):
        # 處理 CORS_ORIGINS 字串到列表的轉換
        if isinstance(self.cors_origins, str):
            try:
                return json.loads(self.cors_origins)
            except:
                return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins


# 創建全局設定實例
settings = Settings()
