from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import db
from app.schemas import User
import logging

logger = logging.getLogger(__name__)

# 密碼加密處理
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer 認證
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證密碼"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """密碼加密"""
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    """創建 JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """從 JWT token 獲取當前使用者"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("userId")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 從資料庫獲取使用者資訊
    query = """
        SELECT u.id, u.email, u.role, r.id as researcher_id, 
               u.created_at, u.updated_at
        FROM users u
        LEFT JOIN researchers r ON u.id = r.user_id
        WHERE u.id = $1
    """
    
    user_record = await db.fetchrow(query, user_id)
    
    if user_record is None:
        raise credentials_exception
    
    return User(**dict(user_record))


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """驗證使用者登入"""
    query = """
        SELECT u.id, u.email, u.password_hash, u.role, r.id as researcher_id,
               u.created_at, u.updated_at
        FROM users u
        LEFT JOIN researchers r ON u.id = r.user_id
        WHERE u.email = $1
    """
    
    user = await db.fetchrow(query, email.lower())
    
    if not user:
        return None
    
    if not verify_password(password, user['password_hash']):
        return None
    
    return dict(user)


def require_role(allowed_roles: list):
    """角色權限檢查裝飾器"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
