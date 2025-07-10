from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import (
    User,
    UserCreate,
    UserInDB,
    ErrorResponse
)
from app.auth import get_current_user, require_role, get_password_hash
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    current_user: User = Depends(require_role(['admin']))
):
    """創建新用戶 (僅管理員)"""
    logger.info(f"Creating user: {user.email} by admin {current_user.email}")
    
    try:
        # 檢查用戶是否已存在
        existing_user = await db.fetchrow("SELECT id FROM users WHERE email = $1", user.email.lower())
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # 加密密碼
        password_hash = get_password_hash(user.password)
        
        # 創建用戶
        query = """
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role, created_at, updated_at
        """
        
        result = await db.fetchrow(query, user.email.lower(), password_hash, user.role)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        # 如果是研究員角色，創建研究員記錄
        researcher_id = None
        if user.role == 'researcher':
            researcher_query = """
                INSERT INTO researchers (user_id, name, email)
                VALUES ($1, $2, $3)
                RETURNING id
            """
            researcher_result = await db.fetchrow(
                researcher_query, 
                result['id'], 
                user.email.split('@')[0],  # 暫時使用 email 前綴作為名稱
                user.email
            )
            researcher_id = researcher_result['id'] if researcher_result else None
        
        logger.info(f"✅ User created: {result['id']}")
        
        return User(
            id=result['id'],
            email=result['email'],
            role=result['role'],
            researcher_id=researcher_id,
            created_at=result['created_at'],
            updated_at=result['updated_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=List[User])
async def get_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(require_role(['admin']))
):
    """獲取用戶列表 (僅管理員)"""
    logger.info(f"Getting users by admin {current_user.email}")
    
    try:
        # 構建查詢
        base_query = """
            SELECT u.id, u.email, u.role, r.id as researcher_id, u.created_at, u.updated_at
            FROM users u
            LEFT JOIN researchers r ON u.id = r.user_id
        """
        
        params = []
        where_clauses = []
        param_count = 0
        
        if role:
            param_count += 1
            where_clauses.append(f"u.role = ${param_count}")
            params.append(role)
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += f" ORDER BY u.created_at DESC LIMIT ${param_count + 1} OFFSET ${param_count + 2}"
        params.extend([limit, skip])
        
        results = await db.fetch(base_query, *params)
        
        users = [User(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(users)} users")
        
        return users
        
    except Exception as e:
        logger.error(f"❌ Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """獲取當前用戶資訊"""
    logger.info(f"Getting current user info for {current_user.email}")
    return current_user


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """獲取特定用戶資料 (僅管理員)"""
    logger.info(f"Getting user {user_id} by admin {current_user.email}")
    
    try:
        query = """
            SELECT u.id, u.email, u.role, r.id as researcher_id, u.created_at, u.updated_at
            FROM users u
            LEFT JOIN researchers r ON u.id = r.user_id
            WHERE u.id = $1
        """
        
        result = await db.fetchrow(query, user_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"✅ Retrieved user: {user_id}")
        return User(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: UUID,
    user_data: UserCreate,
    current_user: User = Depends(require_role(['admin']))
):
    """更新用戶資料 (僅管理員)"""
    logger.info(f"Updating user {user_id} by admin {current_user.email}")
    
    try:
        # 檢查用戶是否存在
        existing = await db.fetchrow("SELECT id, role FROM users WHERE id = $1", user_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # 檢查 email 是否已被其他用戶使用
        email_check = await db.fetchrow(
            "SELECT id FROM users WHERE email = $1 AND id != $2", 
            user_data.email.lower(), 
            user_id
        )
        if email_check:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use by another user"
            )
        
        # 更新密碼（如果提供）
        password_hash = get_password_hash(user_data.password)
        
        # 更新用戶
        query = """
            UPDATE users 
            SET email = $2, password_hash = $3, role = $4, updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, role, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            user_id,
            user_data.email.lower(),
            password_hash,
            user_data.role
        )
        
        # 處理角色變更
        researcher_id = None
        if user_data.role == 'researcher':
            # 檢查是否已有研究員記錄
            researcher = await db.fetchrow("SELECT id FROM researchers WHERE user_id = $1", user_id)
            if not researcher:
                # 創建研究員記錄
                researcher_query = """
                    INSERT INTO researchers (user_id, name, email)
                    VALUES ($1, $2, $3)
                    RETURNING id
                """
                researcher_result = await db.fetchrow(
                    researcher_query, 
                    user_id, 
                    user_data.email.split('@')[0],
                    user_data.email
                )
                researcher_id = researcher_result['id'] if researcher_result else None
            else:
                researcher_id = researcher['id']
        elif existing['role'] == 'researcher' and user_data.role != 'researcher':
            # 從研究員角色變更為其他角色，刪除研究員記錄
            await db.execute("DELETE FROM researchers WHERE user_id = $1", user_id)
        
        logger.info(f"✅ User updated: {user_id}")
        
        return User(
            id=result['id'],
            email=result['email'],
            role=result['role'],
            researcher_id=researcher_id,
            created_at=result['created_at'],
            updated_at=result['updated_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """刪除用戶 (僅管理員)"""
    logger.info(f"Deleting user {user_id} by admin {current_user.email}")
    
    try:
        # 檢查用戶是否存在
        existing = await db.fetchrow("SELECT id FROM users WHERE id = $1", user_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # 防止管理員刪除自己
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete your own account"
            )
        
        # 先刪除相關的研究員記錄
        await db.execute("DELETE FROM researchers WHERE user_id = $1", user_id)
        
        # 刪除用戶
        await db.execute("DELETE FROM users WHERE id = $1", user_id)
        
        logger.info(f"✅ User deleted: {user_id}")
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/stats/overview")
async def get_users_stats(
    current_user: User = Depends(require_role(['admin']))
):
    """獲取用戶統計資料 (僅管理員)"""
    logger.info(f"Getting user stats by admin {current_user.email}")
    
    try:
        stats_query = """
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                COUNT(CASE WHEN role = 'researcher' THEN 1 END) as researcher_users
            FROM users
        """
        
        stats = await db.fetchrow(stats_query)
        
        result = {
            "total_users": stats['total_users'],
            "admin_users": stats['admin_users'],
            "researcher_users": stats['researcher_users']
        }
        
        logger.info(f"✅ Retrieved user stats")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
