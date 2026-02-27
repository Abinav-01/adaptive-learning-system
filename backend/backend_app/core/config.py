from dotenv import load_dotenv
import os


load_dotenv()


class Settings:
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_this_secret_key_for_production")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")


settings = Settings()
