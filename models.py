from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Time, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_doctor = Column(Boolean, default=False)
    name = Column(String)
    phone = Column(String)
    whatsapp = Column(String, nullable=True)

    # Relationships
    appointments_as_patient = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient")
    appointments_as_doctor = relationship("Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    time = Column(Time)
    status = Column(String)  # scheduled, completed, cancelled
    notes = Column(String, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor") 