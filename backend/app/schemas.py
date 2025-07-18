from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime, date
from uuid import UUID


# 使用者相關模型
class UserBase(BaseModel):
    email: EmailStr
    role: Literal['admin', 'researcher']


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    researcher_id: Optional[UUID] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(User):
    password_hash: str


class Token(BaseModel):
    token: str
    user: User


# 參與者相關模型
class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    gender: Literal['male', 'female', 'other', 'prefer_not_to_say']
    email: Optional[EmailStr] = None
    phone: str = Field(..., min_length=1, max_length=20)
    birth_date: date
    address: Optional[str] = None
    status: Literal['active', 'completed', 'withdrawn'] = 'active'


class ParticipantCreate(ParticipantBase):
    pass


class Participant(ParticipantBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# 計畫相關模型
class ProjectBase(BaseModel):
    project_number: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Literal['planning', 'active', 'completed', 'suspended'] = 'planning'


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# 子計畫相關模型
class SubprojectBase(BaseModel):
    project_id: UUID
    subproject_number: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: Literal['planning', 'active', 'completed', 'suspended'] = 'active'


class SubprojectCreate(SubprojectBase):
    pass


class Subproject(SubprojectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# 健康檢查模型
class HealthCheck(BaseModel):
    status: str
    database: str
    timestamp: datetime
    database_time: Optional[datetime] = None
    server_info: str = "Psychology Lab API v1.0"
    error: Optional[str] = None


# 同意書版本相關模型
class ConsentVersionBase(BaseModel):
    version_name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    is_active: bool = True


class ConsentVersionCreate(ConsentVersionBase):
    pass


class ConsentVersion(ConsentVersionBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# 專案參與者相關模型
class ProjectParticipantBase(BaseModel):
    participant_project_id: Optional[str] = Field(None, max_length=100)
    participant_subproject_id: Optional[str] = Field(None, max_length=100)
    status: Literal['active', 'completed', 'terminated'] = 'active'
    join_date: Optional[date] = None
    termination_reason: Optional[str] = None


class ProjectParticipantCreate(ProjectParticipantBase):
    participant_id: UUID
    consent_version_ids: Optional[List[UUID]] = None


class ProjectParticipantUpdate(BaseModel):
    participant_project_id: Optional[str] = Field(None, max_length=100)
    participant_subproject_id: Optional[str] = Field(None, max_length=100)
    status: Optional[Literal['active', 'completed', 'terminated']] = None
    join_date: Optional[date] = None
    termination_reason: Optional[str] = None
    consent_version_ids: Optional[List[UUID]] = None


class ProjectParticipant(ProjectParticipantBase):
    id: UUID
    project_id: UUID
    participant_id: UUID
    created_at: datetime
    updated_at: datetime
    consent_versions: List[ConsentVersion] = []
    
    model_config = ConfigDict(from_attributes=True)


# 錯誤回應模型
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
