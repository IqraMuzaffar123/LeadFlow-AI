from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://leadflow:leadflow_dev@localhost:5432/leadflow"
    anthropic_api_key: str = ""
    hubspot_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
