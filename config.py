import os


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-change-me')
    # Add other configuration defaults here as needed


