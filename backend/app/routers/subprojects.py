from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import (
    Subproject,
    SubprojectCreate,
    User
)
from app.auth import get_current_user, require_role
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/subprojects",
    tags=["subprojects"]
)


@router.get("/{subproject_id}", response_model=Subproject)
async def get_subproject(
    subproject_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取特定子專案資料"""
    logger.info(f"Getting subproject {subproject_id} by user {current_user.email}")
    
    try:
        query = """
            SELECT id, project_id, subproject_number, title, description, status, created_at, updated_at
            FROM subprojects
            WHERE id = $1
        """
        
        result = await db.fetchrow(query, subproject_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subproject not found"
            )
        
        logger.info(f"✅ Retrieved subproject: {subproject_id}")
        return Subproject(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting subproject: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{subproject_id}", response_model=Subproject)
async def update_subproject(
    subproject_id: UUID,
    subproject_data: SubprojectCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """更新子專案資料"""
    logger.info(f"Updating subproject {subproject_id} by user {current_user.email}")
    
    try:
        # 檢查子專案是否存在
        existing = await db.fetchrow("SELECT id, project_id FROM subprojects WHERE id = $1", subproject_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subproject not found"
            )
        
        # 檢查相關專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", subproject_data.project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Related project not found"
            )
        
        query = """
            UPDATE subprojects 
            SET project_id = $2, subproject_number = $3, title = $4, description = $5, 
                status = $6, updated_at = NOW()
            WHERE id = $1
            RETURNING id, project_id, subproject_number, title, description, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            subproject_id,
            subproject_data.project_id,
            subproject_data.subproject_number,
            subproject_data.title,
            subproject_data.description,
            subproject_data.status
        )
        
        logger.info(f"✅ Subproject updated: {subproject_id}")
        return Subproject(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating subproject: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Subproject with this number already exists in this project"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{subproject_id}")
async def delete_subproject(
    subproject_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """刪除子專案 (僅管理員)"""
    logger.info(f"Deleting subproject {subproject_id} by admin {current_user.email}")
    
    try:
        # 檢查子專案是否存在
        existing = await db.fetchrow("SELECT id FROM subprojects WHERE id = $1", subproject_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subproject not found"
            )
        
        await db.execute("DELETE FROM subprojects WHERE id = $1", subproject_id)
        
        logger.info(f"✅ Subproject deleted: {subproject_id}")
        return {"message": "Subproject deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting subproject: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=List[Subproject])
async def get_all_subprojects(
    status: Optional[str] = Query(None, description="Filter by status"),
    project_id: Optional[UUID] = Query(None, description="Filter by project ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user)
):
    """獲取所有子專案列表（可篩選）"""
    logger.info(f"Getting all subprojects by user {current_user.email}")
    
    try:
        # 構建查詢
        base_query = """
            SELECT id, project_id, subproject_number, title, description, status, created_at, updated_at
            FROM subprojects
        """
        
        params = []
        where_clauses = []
        param_count = 0
        
        if status:
            param_count += 1
            where_clauses.append(f"status = ${param_count}")
            params.append(status)
        
        if project_id:
            param_count += 1
            where_clauses.append(f"project_id = ${param_count}")
            params.append(project_id)
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += f" ORDER BY created_at DESC LIMIT ${param_count + 1} OFFSET ${param_count + 2}"
        params.extend([limit, skip])
        
        results = await db.fetch(base_query, *params)
        
        subprojects = [Subproject(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(subprojects)} subprojects")
        
        return subprojects
        
    except Exception as e:
        logger.error(f"❌ Error getting subprojects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{subproject_id}/stats")
async def get_subproject_stats(
    subproject_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取子專案統計資料"""
    logger.info(f"Getting subproject stats {subproject_id} by user {current_user.email}")
    
    try:
        # 檢查子專案是否存在並獲取相關資訊
        subproject = await db.fetchrow("""
            SELECT s.id, s.title, s.project_id, p.title as project_title
            FROM subprojects s
            JOIN projects p ON s.project_id = p.id
            WHERE s.id = $1
        """, subproject_id)
        
        if not subproject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subproject not found"
            )
        
        # 這裡可以根據實際需求擴展統計資料
        # 例如：實驗次數、參與者數量等
        stats = {
            "subproject_id": subproject_id,
            "subproject_title": subproject['title'],
            "project_id": subproject['project_id'],
            "project_title": subproject['project_title'],
            "total_experiments": 0,  # 未來可以從實驗記錄表中獲取
            "total_participants": 0,  # 未來可以從參與記錄表中獲取
            "completed_experiments": 0,
            "pending_experiments": 0
        }
        
        logger.info(f"✅ Retrieved subproject stats: {subproject_id}")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting subproject stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
