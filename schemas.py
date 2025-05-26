from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, time

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    whatsapp: Optional[str] = None
    is_doctor: bool = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    date: date
    time: time
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[time] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    patient: User
    doctor: User

    class Config:
        from_attributes = True 