from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database import engine, Base

from routers.auth import router as auth_router
from routers.events import router as events_router
from routers.registrations import router as registrations_router
from routers.checkin import router as checkin_router
from routers.my_registrations import router as my_router
from routers.certificates import router as certificates_router

# Import all models so SQLAlchemy knows about them
from models.user import User
from models.event import Event
from models.registration import Registration
from models.attendance import Attendance
from models.volunteer import Volunteer
from models.certificate import Certificate
from models.feedback import Feedback
from models.certificate_template import CertificateTemplate

app = FastAPI(title="EventSphere API")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://eventsphere-frontend-5x80.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CERTIFICATE_FOLDER = Path("generated_certificates")
CERTIFICATE_FOLDER.mkdir(exist_ok=True)

app.mount(
    "/generated_certificates",
    StaticFiles(directory=str(CERTIFICATE_FOLDER)),
    name="generated_certificates"
)

# =========================================================
# QR CODE STATIC FILES
# =========================================================

QR_FOLDER = Path("generated_qr")
QR_FOLDER.mkdir(exist_ok=True)

app.mount(
    "/generated_qr",
    StaticFiles(directory=str(QR_FOLDER)),
    name="generated_qr"
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(registrations_router)
app.include_router(checkin_router)
app.include_router(my_router)
app.include_router(certificates_router)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "EventSphere API is running!"
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/test-db")
def test_database():
    try:
        with engine.connect():
            return {
                "message": "Database connection successful!"
            }

    except Exception as e:
        return {
            "error": str(e)
        }