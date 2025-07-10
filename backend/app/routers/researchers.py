from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import User
from app.auth import get_current_user, require_role
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/researchers",
    tags=["researchers"]
)


@router.get("/", response_model=List[dict])
async def get_researchers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user)
):
    """獲取研究員列表"""
    logger.info(f"Getting researchers by user {current_user.email}")
    
    try:
        query = """
            SELECT 
                r.id,
                r.user_id,
                r.name,
                r.email,
                r.department,
                r.position,
                r.phone,
                r.bio,
                r.created_at,
                r.updated_at,
                u.role as user_role
            FROM researchers r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        """
        
        results = await db.fetch(query, limit, skip)
        
        researchers = []
        for row in results:
            researcher = {
                "id": row['id'],
                "user_id": row['user_id'],
                "name": row['name'],
                "email": row['email'],
                "department": row['department'],
                "position": row['position'],
                "phone": row['phone'],
                "bio": row['bio'],
                "user_role": row['user_role'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            }
            researchers.append(researcher)
        
        logger.info(f"✅ Retrieved {len(researchers)} researchers")
        return researchers
        
    except Exception as e:
        logger.error(f"❌ Error getting researchers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{researcher_id}", response_model=dict)
async def get_researcher(
    researcher_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取特定研究員資料"""
    logger.info(f"Getting researcher {researcher_id} by user {current_user.email}")
    
    try:
        query = """
            SELECT 
                r.id,
                r.user_id,
                r.name,
                r.email,
                r.department,
                r.position,
                r.phone,
                r.bio,
                r.created_at,
                r.updated_at,
                u.role as user_role
            FROM researchers r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        """
        
        result = await db.fetchrow(query, researcher_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher not found"
            )
        
        researcher = {
            "id": result['id'],
            "user_id": result['user_id'],
            "name": result['name'],
            "email": result['email'],
            "department": result['department'],
            "position": result['position'],
            "phone": result['phone'],
            "bio": result['bio'],
            "user_role": result['user_role'],
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        logger.info(f"✅ Retrieved researcher: {researcher_id}")
        return researcher
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting researcher: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{researcher_id}", response_model=dict)
async def update_researcher(
    researcher_id: UUID,
    researcher_data: dict,
    current_user: User = Depends(get_current_user)
):
    """更新研究員資料"""
    logger.info(f"Updating researcher {researcher_id} by user {current_user.email}")
    
    try:
        # 檢查研究員是否存在
        existing = await db.fetchrow("SELECT id, user_id FROM researchers WHERE id = $1", researcher_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher not found"
            )
        
        # 權限檢查：只有管理員或研究員本人可以更新
        if current_user.role != 'admin' and current_user.researcher_id != researcher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this researcher"
            )
        
        # 構建更新查詢
        update_fields = []
        params = [researcher_id]
        param_count = 1
        
        allowed_fields = ['name', 'email', 'department', 'position', 'phone', 'bio']
        
        for field in allowed_fields:
            if field in researcher_data:
                param_count += 1
                update_fields.append(f"{field} = ${param_count}")
                params.append(researcher_data[field])
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        query = f"""
            UPDATE researchers 
            SET {', '.join(update_fields)}, updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, name, email, department, position, phone, bio, created_at, updated_at
        """
        
        result = await db.fetchrow(query, *params)
        
        # 獲取用戶角色
        user_role = await db.fetchval("SELECT role FROM users WHERE id = $1", result['user_id'])
        
        researcher = {
            "id": result['id'],
            "user_id": result['user_id'],
            "name": result['name'],
            "email": result['email'],
            "department": result['department'],
            "position": result['position'],
            "phone": result['phone'],
            "bio": result['bio'],
            "user_role": user_role,
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        logger.info(f"✅ Researcher updated: {researcher_id}")
        return researcher
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating researcher: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{researcher_id}/projects")
async def get_researcher_projects(
    researcher_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取研究員的專案列表"""
    logger.info(f"Getting projects for researcher {researcher_id} by user {current_user.email}")
    
    try:
        # 檢查研究員是否存在
        researcher = await db.fetchrow("SELECT id FROM researchers WHERE id = $1", researcher_id)
        if not researcher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher not found"
            )
        
        # 這裡暫時返回空列表，未來可以根據實際需求實現專案-研究員關聯
        # 例如：從 project_researchers 關聯表中查詢
        projects = []
        
        logger.info(f"✅ Retrieved {len(projects)} projects for researcher {researcher_id}")
        return {"researcher_id": researcher_id, "projects": projects}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting researcher projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/stats/overview")
async def get_researchers_stats(
    current_user: User = Depends(get_current_user)
):
    """獲取研究員統計資料"""
    logger.info(f"Getting researcher stats by user {current_user.email}")
    
    try:
        stats_query = """
            SELECT 
                COUNT(*) as total_researchers,
                COUNT(CASE WHEN department IS NOT NULL THEN 1 END) as researchers_with_department,
                COUNT(CASE WHEN position IS NOT NULL THEN 1 END) as researchers_with_position
            FROM researchers
        """
        
        stats = await db.fetchrow(stats_query)
        
        result = {
            "total_researchers": stats['total_researchers'],
            "researchers_with_department": stats['researchers_with_department'],
            "researchers_with_position": stats['researchers_with_position']
        }
        
        logger.info(f"✅ Retrieved researcher stats")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error getting researcher stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/me/profile")
async def get_my_researcher_profile(
    current_user: User = Depends(require_role(['researcher']))
):
    """獲取當前研究員的個人資料"""
    logger.info(f"Getting researcher profile for user {current_user.email}")
    
    try:
        if not current_user.researcher_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher profile not found"
            )
        
        query = """
            SELECT 
                r.id,
                r.user_id,
                r.name,
                r.email,
                r.department,
                r.position,
                r.phone,
                r.bio,
                r.created_at,
                r.updated_at
            FROM researchers r
            WHERE r.id = $1
        """
        
        result = await db.fetchrow(query, current_user.researcher_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher profile not found"
            )
        
        researcher = {
            "id": result['id'],
            "user_id": result['user_id'],
            "name": result['name'],
            "email": result['email'],
            "department": result['department'],
            "position": result['position'],
            "phone": result['phone'],
            "bio": result['bio'],
            "user_role": current_user.role,
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        logger.info(f"✅ Retrieved researcher profile for user {current_user.email}")
        return researcher
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting researcher profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/me/profile")
async def update_my_researcher_profile(
    researcher_data: dict,
    current_user: User = Depends(require_role(['researcher']))
):
    """更新當前研究員的個人資料"""
    logger.info(f"Updating researcher profile for user {current_user.email}")
    
    try:
        if not current_user.researcher_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher profile not found"
            )
        
        # 構建更新查詢
        update_fields = []
        params = [current_user.researcher_id]
        param_count = 1
        
        allowed_fields = ['name', 'email', 'department', 'position', 'phone', 'bio']
        
        for field in allowed_fields:
            if field in researcher_data:
                param_count += 1
                update_fields.append(f"{field} = ${param_count}")
                params.append(researcher_data[field])
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        query = f"""
            UPDATE researchers 
            SET {', '.join(update_fields)}, updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, name, email, department, position, phone, bio, created_at, updated_at
        """
        
        result = await db.fetchrow(query, *params)
        
        researcher = {
            "id": result['id'],
            "user_id": result['user_id'],
            "name": result['name'],
            "email": result['email'],
            "department": result['department'],
            "position": result['position'],
            "phone": result['phone'],
            "bio": result['bio'],
            "user_role": current_user.role,
            "created_at": result['created_at'],
            "updated_at": result['updated_at']
        }
        
        logger.info(f"✅ Researcher profile updated for user {current_user.email}")
        return researcher
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating researcher profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
