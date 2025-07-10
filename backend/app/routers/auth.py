from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UserLogin, Token, User
from app.auth import authenticate_user, create_access_token, get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)


@router.post("/login", response_model=Token)
async def login(user_login: UserLogin):
    """使用者登入"""
    logger.info(f"🔐 Login attempt: {user_login.email}")
    
    user = await authenticate_user(user_login.email, user_login.password)
    
    if not user:
        logger.warning(f"❌ Login failed for: {user_login.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 創建 JWT token
    access_token = create_access_token(
        data={
            "userId": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }
    )
    
    logger.info(f"✅ Login successful for: {user_login.email}")
    
    return {
        "token": access_token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "researcher_id": user.get("researcher_id"),
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
    }


@router.get("/profile", response_model=dict)
async def get_profile(current_user: User = Depends(get_current_user)):
    """獲取當前使用者資料"""
    return {"user": current_user}
