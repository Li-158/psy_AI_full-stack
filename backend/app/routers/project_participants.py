from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import (
    ProjectParticipant,
    ProjectParticipantCreate,
    ProjectParticipantUpdate,
    ConsentVersion,
    User
)
from app.auth import get_current_user, require_role
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/projects/{project_id}/participants",
    tags=["project-participants"]
)


@router.post("/", response_model=ProjectParticipant, status_code=status.HTTP_201_CREATED)
async def add_participant_to_project(
    project_id: UUID,
    participant_data: ProjectParticipantCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """將參與者加入專案"""
    logger.info(f"Adding participant {participant_data.participant_id} to project {project_id}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 檢查參與者是否存在
        participant_exists = await db.fetchrow("SELECT id FROM participants WHERE id = $1", participant_data.participant_id)
        if not participant_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found"
            )
        
        # 創建專案參與者記錄
        query = """
            INSERT INTO project_participants 
            (project_id, participant_id, participant_project_id, participant_subproject_id, 
             status, join_date, termination_reason)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, project_id, participant_id, participant_project_id, 
                      participant_subproject_id, status, join_date, termination_reason, 
                      created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            project_id,
            participant_data.participant_id,
            participant_data.participant_project_id,
            participant_data.participant_subproject_id,
            participant_data.status,
            participant_data.join_date,
            participant_data.termination_reason
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add participant to project"
            )
        
        project_participant_id = result['id']
        
        # 如果有同意書版本，創建關聯
        if participant_data.consent_version_ids:
            for version_id in participant_data.consent_version_ids:
                # 檢查版本是否存在且屬於該專案
                version_exists = await db.fetchrow(
                    "SELECT id FROM consent_versions WHERE id = $1 AND project_id = $2",
                    version_id, project_id
                )
                if version_exists:
                    await db.execute(
                        """
                        INSERT INTO participant_consent_versions 
                        (project_participant_id, consent_version_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                        """,
                        project_participant_id,
                        version_id
                    )
        
        # 獲取同意書版本
        consent_versions = await get_participant_consent_versions(project_participant_id)
        
        project_participant = ProjectParticipant(**dict(result))
        project_participant.consent_versions = consent_versions
        
        logger.info(f"✅ Participant added to project: {project_participant_id}")
        return project_participant
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error adding participant to project: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Participant already exists in this project"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=List[ProjectParticipant])
async def get_project_participants(
    project_id: UUID,
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user)
):
    """獲取專案的參與者列表"""
    logger.info(f"Getting participants for project {project_id}")
    
    try:
        # 檢查專案是否存在
        project_exists = await db.fetchrow("SELECT id FROM projects WHERE id = $1", project_id)
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # 構建查詢
        query = """
            SELECT pp.id, pp.project_id, pp.participant_id, pp.participant_project_id,
                   pp.participant_subproject_id, pp.status, pp.join_date, pp.termination_reason,
                   pp.created_at, pp.updated_at
            FROM project_participants pp
            WHERE pp.project_id = $1
        """
        
        params = [project_id]
        
        if status:
            query += " AND pp.status = $2"
            params.append(status)
        
        query += " ORDER BY pp.created_at DESC"
        
        results = await db.fetch(query, *params)
        
        participants = []
        for row in results:
            participant = ProjectParticipant(**dict(row))
            participant.consent_versions = await get_participant_consent_versions(participant.id)
            participants.append(participant)
        
        logger.info(f"✅ Retrieved {len(participants)} project participants")
        return participants
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting project participants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{participant_id}", response_model=ProjectParticipant)
async def update_project_participant(
    project_id: UUID,
    participant_id: UUID,
    update_data: ProjectParticipantUpdate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """更新專案參與者資料"""
    logger.info(f"Updating project participant {participant_id} in project {project_id}")
    
    try:
        # 檢查記錄是否存在
        existing = await db.fetchrow(
            "SELECT id FROM project_participants WHERE id = $1 AND project_id = $2",
            participant_id, project_id
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project participant not found"
            )
        
        # 構建更新查詢
        update_fields = []
        params = [participant_id, project_id]
        param_count = 2
        
        if update_data.participant_project_id is not None:
            param_count += 1
            update_fields.append(f"participant_project_id = ${param_count}")
            params.append(update_data.participant_project_id)
        
        if update_data.participant_subproject_id is not None:
            param_count += 1
            update_fields.append(f"participant_subproject_id = ${param_count}")
            params.append(update_data.participant_subproject_id)
        
        if update_data.status is not None:
            param_count += 1
            update_fields.append(f"status = ${param_count}")
            params.append(update_data.status)
        
        if update_data.join_date is not None:
            param_count += 1
            update_fields.append(f"join_date = ${param_count}")
            params.append(update_data.join_date)
        
        if update_data.termination_reason is not None:
            param_count += 1
            update_fields.append(f"termination_reason = ${param_count}")
            params.append(update_data.termination_reason)
        
        if update_fields:
            update_fields.append("updated_at = NOW()")
            query = f"""
                UPDATE project_participants 
                SET {', '.join(update_fields)}
                WHERE id = $1 AND project_id = $2
                RETURNING id, project_id, participant_id, participant_project_id,
                          participant_subproject_id, status, join_date, termination_reason,
                          created_at, updated_at
            """
            
            result = await db.fetchrow(query, *params)
        else:
            # 如果沒有更新字段，直接返回現有記錄
            result = await db.fetchrow(
                """
                SELECT id, project_id, participant_id, participant_project_id,
                       participant_subproject_id, status, join_date, termination_reason,
                       created_at, updated_at
                FROM project_participants
                WHERE id = $1 AND project_id = $2
                """,
                participant_id, project_id
            )
        
        # 更新同意書版本
        if update_data.consent_version_ids is not None:
            # 刪除現有的版本關聯
            await db.execute(
                "DELETE FROM participant_consent_versions WHERE project_participant_id = $1",
                participant_id
            )
            
            # 添加新的版本關聯
            for version_id in update_data.consent_version_ids:
                version_exists = await db.fetchrow(
                    "SELECT id FROM consent_versions WHERE id = $1 AND project_id = $2",
                    version_id, project_id
                )
                if version_exists:
                    await db.execute(
                        """
                        INSERT INTO participant_consent_versions 
                        (project_participant_id, consent_version_id)
                        VALUES ($1, $2)
                        """,
                        participant_id,
                        version_id
                    )
        
        # 獲取同意書版本
        project_participant = ProjectParticipant(**dict(result))
        project_participant.consent_versions = await get_participant_consent_versions(participant_id)
        
        logger.info(f"✅ Project participant updated: {participant_id}")
        return project_participant
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating project participant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{participant_id}")
async def remove_participant_from_project(
    project_id: UUID,
    participant_id: UUID,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """從專案中移除參與者"""
    logger.info(f"Removing participant {participant_id} from project {project_id}")
    
    try:
        # 檢查記錄是否存在
        existing = await db.fetchrow(
            "SELECT id FROM project_participants WHERE id = $1 AND project_id = $2",
            participant_id, project_id
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project participant not found"
            )
        
        # 刪除記錄（相關的同意書版本會因為 CASCADE 自動刪除）
        await db.execute(
            "DELETE FROM project_participants WHERE id = $1 AND project_id = $2",
            participant_id, project_id
        )
        
        logger.info(f"✅ Participant removed from project: {participant_id}")
        return {"message": "Participant removed from project successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error removing participant from project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# 輔助函數
async def get_participant_consent_versions(project_participant_id: UUID) -> List[ConsentVersion]:
    """獲取參與者的同意書版本"""
    query = """
        SELECT cv.id, cv.project_id, cv.version_name, cv.description, 
               cv.is_active, cv.created_at, cv.updated_at
        FROM consent_versions cv
        JOIN participant_consent_versions pcv ON cv.id = pcv.consent_version_id
        WHERE pcv.project_participant_id = $1
        ORDER BY cv.created_at DESC
    """
    
    results = await db.fetch(query, project_participant_id)
    return [ConsentVersion(**dict(row)) for row in results]
