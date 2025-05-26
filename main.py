from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import models
import schemas
from database import SessionLocal, engine
from twilio.rest import Client
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedReminder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialize Twilio client
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()

def send_reminder(appointment_id: int, db: Session):
    """Send appointment reminder via SMS and WhatsApp"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        return

    patient = appointment.patient
    doctor = appointment.doctor
    
    message = f"Reminder: You have an appointment with Dr. {doctor.name} on {appointment.date} at {appointment.time}."
    
    # Send SMS
    if patient.phone:
        try:
            twilio_client.messages.create(
                body=message,
                from_=os.getenv("TWILIO_PHONE_NUMBER"),
                to=patient.phone
            )
        except Exception as e:
            print(f"Failed to send SMS: {e}")

    # Send WhatsApp (if configured)
    if patient.whatsapp:
        try:
            twilio_client.messages.create(
                body=message,
                from_=f"whatsapp:{os.getenv('TWILIO_PHONE_NUMBER')}",
                to=f"whatsapp:{patient.whatsapp}"
            )
        except Exception as e:
            print(f"Failed to send WhatsApp message: {e}")

# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        phone=user.phone,
        whatsapp=user.whatsapp,
        is_doctor=user.is_doctor
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[schemas.User])
def get_users(
    skip: int = 0,
    limit: int = 100,
    is_doctor: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get list of users with optional filters"""
    query = db.query(models.User)
    
    if is_doctor is not None:
        query = query.filter(models.User.is_doctor == is_doctor)
    
    return query.offset(skip).limit(limit).all()

# Appointment endpoints
@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment"""
    db_appointment = models.Appointment(
        **appointment.dict(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Schedule reminder (24 hours before appointment)
    appointment_time = datetime.combine(appointment.date, appointment.time)
    reminder_time = appointment_time - timedelta(hours=24)
    
    if reminder_time > datetime.now():
        scheduler.add_job(
            send_reminder,
            trigger=IntervalTrigger(
                start_date=reminder_time,
                seconds=0
            ),
            args=[db_appointment.id, db]
        )
    
    return db_appointment

@app.get("/appointments/", response_model=List[schemas.Appointment])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get list of appointments with optional filters"""
    query = db.query(models.Appointment)
    
    if patient_id:
        query = query.filter(models.Appointment.patient_id == patient_id)
    if doctor_id:
        query = query.filter(models.Appointment.doctor_id == doctor_id)
    
    return query.offset(skip).limit(limit).all()

@app.get("/appointments/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Get a specific appointment by ID"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(
    appointment_id: int,
    appointment: schemas.AppointmentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing appointment"""
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for key, value in appointment.dict(exclude_unset=True).items():
        setattr(db_appointment, key, value)
    
    db_appointment.updated_at = datetime.now()
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Delete an appointment"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 