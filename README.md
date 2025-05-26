# MedReminder - Medical Appointment Management System

A comprehensive solution for managing patient appointments and automated follow-ups through multiple communication channels.

## Features

- Appointment scheduling and management
- Automated reminders via SMS and WhatsApp
- Patient and doctor dashboards
- Appointment history tracking
- Multi-channel communication support

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React with TypeScript
- Database: PostgreSQL
- Messaging: Twilio (SMS & WhatsApp)

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Twilio Account (for SMS/WhatsApp integration)

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the frontend:
```bash
npm start
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/medreminder
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

## License

MIT 