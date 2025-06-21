import os
from dotenv import load_dotenv

class Config:
    """Base configuration class."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'True').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # MongoDB
    MONGODB_HOST = os.environ.get('MONGODB_HOST')
    MONGODB_USERNAME = os.environ.get('MONGODB_USERNAME')
    MONGODB_PASSWORD = os.environ.get('MONGODB_PASSWORD')
    MONGODB_DB_NAME = os.environ.get('MONGODB_DB_NAME')
    
    # OpenAI
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Auth0
    AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
    AUTH0_AUDIENCE = os.environ.get('AUTH0_AUDIENCE')
    ALGORITHM = os.environ.get('ALGORITHM', 'RS256')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    
    def __init__(self):
        load_dotenv('.env.development')

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    
    def __init__(self):
        load_dotenv('.env.production')

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    
    def __init__(self):
        load_dotenv('.env.testing')

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 