from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import (
    Project, 
    ProjectCreate, 
    Subproject,
    SubprojectCreate,
    User,
    ConsentVersion,
    ConsentVersionCreate,
    ProjectParticipant,
    ProjectParticipantCreate,
    ProjectParticipantUpdate
)
from app.auth import get_current_user, require_role
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """創建新專案"""
    logger.info(f"Creating project: {project.title} by user {current_user.email}")
    
    try:
        query = """
            INSERT INTO projects (project_number, title, description, start_date, end_date, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, project_number, title, description, start_date, end_date, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            project.project_number,
            project.title,
            project.description,
            project.start_date,
            project.end_date,
            project.status
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create project"
            )
        
        logger.info(f"✅ Project created: {result['id']}")
        return Project(**dict(result))
        
    except Exception as e:
        logger.error(f"❌ Error creating project: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project with this project number already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=List[Project])
async def get_projects(
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user)
):
    """獲取專案列表"""
    logger.info(f"Getting projects by user {current_user.email}")
    
    try:
        # 構建查詢
        base_query = """
            SELECT id, project_number, title, description, start_date, end_date, status, created_at, updated_at
            FROM projects
        """
        
        params = []
        where_clauses = []
        param_count = 0
        
        if status:
            param_count += 1
            where_clauses.append(f"status = ${param_count}")
            params.append(status)
        
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        base_query += f" ORDER BY created_at DESC LIMIT ${param_count + 1} OFFSET ${param_count + 2}"
        params.extend([limit, skip])
        
        results = await db.fetch(base_query, *params)
        
        projects = [Project(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(projects)} projects")
        
        return projects
        
    except Exception as e:
        logger.error(f"❌ Error getting projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取特定專案資料"""
    logger.info(f"Getting project {project_id} by user {current_user.email}")
    
    try:
        query = """
            SELECT id, project_number, title, description, start_date, end_date, status, created_at, updated_at
            FROM projects
            WHERE id = $1
        """
        
        result = await db.fetchrow(query, project_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        logger.info(f"✅ Retrieved project: {project_id}")
        return Project(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: UUID,
    project: ProjectCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """更新專案資料"""
    logger.info(f"Updating project {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        existing = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        query = """
            UPDATE projects 
            SET project_number = $2, title = $3, description = $4, start_date = $5, 
                end_date = $6, status = $7, updated_at = NOW()
            WHERE id = $1
            RETURNING id, project_number, title, description, start_date, end_date, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            project_id,
            project.project_number,
            project.title,
            project.description,
            project.start_date,
            project.end_date,
            project.status
        )
        
        logger.info(f"✅ Project updated: {project_id}")
        return Project(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating project: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project with this project number already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """刪除專案 (僅管理員)"""
    logger.info(f"Deleting project {project_id} by admin {current_user.email}")
    
    try:
        # 檢查專案是否存在
        existing = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 檢查是否有相關的子專案
        subprojects = await db.fetchval("SELECT COUNT(*) FROM subprojects WHERE project_id = $1", project_id)
        if subprojects > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete project with existing subprojects"
            )
        
        await db.execute("DELETE FROM projects WHERE id = $1", project_id)
        
        logger.info(f"✅ Project deleted: {project_id}")
        return {"message": "Project deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# 子專案相關端點
@router.post("/{project_id}/subprojects", response_model=Subproject, status_code=status.HTTP_201_CREATED)
async def create_subproject(
    project_id: UUID,
    subproject: SubprojectCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """為專案創建子專案"""
    logger.info(f"Creating subproject for project {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 確保 subproject.project_id 與 URL 中的 project_id 一致
        subproject.project_id = project_id
        
        query = """
            INSERT INTO subprojects (project_id, subproject_number, title, description, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, project_id, subproject_number, title, description, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            subproject.project_id,
            subproject.subproject_number,
            subproject.title,
            subproject.description,
            subproject.status
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create subproject"
            )
        
        logger.info(f"✅ Subproject created: {result['id']}")
        return Subproject(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating subproject: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Subproject with this number already exists in this project"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{project_id}/subprojects", response_model=List[Subproject])
async def get_subprojects(
    project_id: UUID,
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user)
):
    """獲取專案的子專案列表"""
    logger.info(f"Getting subprojects for project {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 構建查詢
        base_query = """
            SELECT id, project_id, subproject_number, title, description, status, created_at, updated_at
            FROM subprojects
            WHERE project_id = $1
        """
        
        params = [project_id]
        
        if status:
            base_query += " AND status = $2"
            params.append(status)
        
        base_query += " ORDER BY created_at DESC"
        
        results = await db.fetch(base_query, *params)
        
        subprojects = [Subproject(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(subprojects)} subprojects")
        
        return subprojects
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting subprojects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{project_id}/stats")
async def get_project_stats(
    project_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取專案統計資料"""
    logger.info(f"Getting project stats {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        project = await db.fetchrow("SELECT id, title FROM projects WHERE id = $1", project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 獲取子專案統計
        subproject_stats = await db.fetchrow("""
            SELECT 
                COUNT(*) as total_subprojects,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subprojects,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_subprojects,
                COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_subprojects,
                COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_subprojects
            FROM subprojects 
            WHERE project_id = $1
        """, project_id)
        
        stats = {
            "project_id": project_id,
            "project_title": project['title'],
            "total_subprojects": subproject_stats['total_subprojects'],
            "active_subprojects": subproject_stats['active_subprojects'],
            "completed_subprojects": subproject_stats['completed_subprojects'],
            "planning_subprojects": subproject_stats['planning_subprojects'],
            "suspended_subprojects": subproject_stats['suspended_subprojects']
        }
        
        logger.info(f"✅ Retrieved project stats: {project_id}")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting project stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# 同意書版本相關端點
@router.post("/{project_id}/consent-versions", response_model=ConsentVersion, status_code=status.HTTP_201_CREATED)
async def create_consent_version(
    project_id: UUID,
    consent_version: ConsentVersionCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """為專案創建同意書版本"""
    logger.info(f"Creating consent version for project {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        query = """
            INSERT INTO consent_versions (project_id, version_name, description, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING id, project_id, version_name, description, is_active, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            project_id,
            consent_version.version_name,
            consent_version.description,
            consent_version.is_active
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create consent version"
            )
        
        logger.info(f"✅ Consent version created: {result['id']}")
        return ConsentVersion(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating consent version: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Consent version with this name already exists in this project"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{project_id}/consent-versions", response_model=List[ConsentVersion])
async def get_consent_versions(
    project_id: UUID,
    active_only: bool = Query(False, description="只返回啟用的版本"),
    current_user: User = Depends(get_current_user)
):
    """獲取專案的同意書版本列表"""
    logger.info(f"Getting consent versions for project {project_id} by user {current_user.email}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        query = """
            SELECT id, project_id, version_name, description, is_active, created_at, updated_at
            FROM consent_versions
            WHERE project_id = $1
        """
        
        params = [project_id]
        
        if active_only:
            query += " AND is_active = true"
        
        query += " ORDER BY created_at DESC"
        
        results = await db.fetch(query, *params)
        
        versions = [ConsentVersion(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(versions)} consent versions")
        
        return versions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting consent versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{project_id}/consent-versions/{version_id}", response_model=ConsentVersion)
async def update_consent_version(
    project_id: UUID,
    version_id: UUID,
    consent_version: ConsentVersionCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """更新同意書版本"""
    logger.info(f"Updating consent version {version_id} for project {project_id} by user {current_user.email}")
    
    try:
        # 檢查版本是否存在且屬於該專案
        existing = await db.fetchrow(
            "SELECT id FROM consent_versions WHERE id = $1 AND project_id = $2", 
            version_id, project_id
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent version not found"
            )
        
        query = """
            UPDATE consent_versions 
            SET version_name = $3, description = $4, is_active = $5, updated_at = NOW()
            WHERE id = $1 AND project_id = $2
            RETURNING id, project_id, version_name, description, is_active, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            version_id,
            project_id,
            consent_version.version_name,
            consent_version.description,
            consent_version.is_active
        )
        
        logger.info(f"✅ Consent version updated: {version_id}")
        return ConsentVersion(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating consent version: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Consent version with this name already exists in this project"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{project_id}/consent-versions/{version_id}")
async def delete_consent_version(
    project_id: UUID,
    version_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """刪除同意書版本 (僅管理員)"""
    logger.info(f"Deleting consent version {version_id} for project {project_id} by admin {current_user.email}")
    
    try:
        # 檢查版本是否存在且屬於該專案
        existing = await db.fetchrow(
            "SELECT id FROM consent_versions WHERE id = $1 AND project_id = $2", 
            version_id, project_id
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent version not found"
            )
        
        # 檢查是否有參與者使用此版本
        participant_count = await db.fetchval(
            "SELECT COUNT(*) FROM participant_consent_versions WHERE consent_version_id = $1", 
            version_id
        )
        if participant_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete consent version used by participants"
            )
        
        await db.execute("DELETE FROM consent_versions WHERE id = $1 AND project_id = $2", version_id, project_id)
        
        logger.info(f"✅ Consent version deleted: {version_id}")
        return {"message": "Consent version deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting consent version: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
