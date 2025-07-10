from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
import logging

from app.schemas import (
    Participant, 
    ParticipantCreate, 
    User
)
from app.auth import get_current_user, require_role
from app.database import db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/participants",
    tags=["participants"]
)


@router.post("/", response_model=Participant, status_code=status.HTTP_201_CREATED)
async def create_participant(
    participant: ParticipantCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """創建新參與者"""
    logger.info(f"Creating participant: {participant.name} by user {current_user.email}")
    
    try:
        query = """
            INSERT INTO participants (name, gender, email, phone, birth_date, address, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, gender, email, phone, birth_date, address, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            participant.name,
            participant.gender,
            participant.email,
            participant.phone,
            participant.birth_date,
            participant.address,
            participant.status
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create participant"
            )
        
        logger.info(f"✅ Participant created: {result['id']}")
        return Participant(**dict(result))
        
    except Exception as e:
        logger.error(f"❌ Error creating participant: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Participant with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=List[Participant])
async def get_participants(
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    current_user: User = Depends(get_current_user)
):
    """獲取參與者列表"""
    logger.info(f"Getting participants by user {current_user.email}")
    
    try:
        # 構建查詢
        base_query = """
            SELECT id, name, gender, email, phone, birth_date, address, status, created_at, updated_at
            FROM participants
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
        
        participants = [Participant(**dict(row)) for row in results]
        logger.info(f"✅ Retrieved {len(participants)} participants")
        
        return participants
        
    except Exception as e:
        logger.error(f"❌ Error getting participants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{participant_id}", response_model=Participant)
async def get_participant(
    participant_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取特定參與者資料"""
    logger.info(f"Getting participant {participant_id} by user {current_user.email}")
    
    try:
        query = """
            SELECT id, name, gender, email, phone, birth_date, address, status, created_at, updated_at
            FROM participants
            WHERE id = $1
        """
        
        result = await db.fetchrow(query, participant_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found"
            )
        
        logger.info(f"✅ Retrieved participant: {participant_id}")
        return Participant(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting participant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{participant_id}", response_model=Participant)
async def update_participant(
    participant_id: UUID,
    participant: ParticipantCreate,
    current_user: User = Depends(require_role(['admin', 'researcher']))
):
    """更新參與者資料"""
    logger.info(f"Updating participant {participant_id} by user {current_user.email}")
    
    try:
        # 檢查參與者是否存在
        existing = await db.fetchrow("SELECT id FROM participants WHERE id = $1", participant_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found"
            )
        
        query = """
            UPDATE participants 
            SET name = $2, gender = $3, email = $4, phone = $5, 
                birth_date = $6, address = $7, status = $8, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, gender, email, phone, birth_date, address, status, created_at, updated_at
        """
        
        result = await db.fetchrow(
            query,
            participant_id,
            participant.name,
            participant.gender,
            participant.email,
            participant.phone,
            participant.birth_date,
            participant.address,
            participant.status
        )
        
        logger.info(f"✅ Participant updated: {participant_id}")
        return Participant(**dict(result))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating participant: {e}")
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Participant with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{participant_id}")
async def delete_participant(
    participant_id: UUID,
    current_user: User = Depends(require_role(['admin']))
):
    """刪除參與者 (僅管理員)"""
    logger.info(f"Deleting participant {participant_id} by admin {current_user.email}")
    
    try:
        # 檢查參與者是否存在
        existing = await db.fetchrow("SELECT id FROM participants WHERE id = $1", participant_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found"
            )
        
        await db.execute("DELETE FROM participants WHERE id = $1", participant_id)
        
        logger.info(f"✅ Participant deleted: {participant_id}")
        return {"message": "Participant deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting participant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{participant_id}/stats")
async def get_participant_stats(
    participant_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """獲取參與者統計資料"""
    logger.info(f"Getting participant stats {participant_id} by user {current_user.email}")
    
    try:
        # 檢查參與者是否存在
        participant = await db.fetchrow("SELECT id, name FROM participants WHERE id = $1", participant_id)
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found"
            )
        
        # 獲取統計資料 (這裡可以根據實際需求擴展)
        stats = {
            "participant_id": participant_id,
            "participant_name": participant['name'],
            "total_experiments": 0,  # 未來可以從實驗記錄表中獲取
            "completed_experiments": 0,
            "upcoming_experiments": 0
        }
        
        logger.info(f"✅ Retrieved participant stats: {participant_id}")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting participant stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
