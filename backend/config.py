import os

from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60