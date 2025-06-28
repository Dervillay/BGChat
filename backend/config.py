import os
from dotenv import load_dotenv


class Config:
    """Base configuration class."""

    def __init__(self):
        self._load_env_vars()
        self._validate_env_vars()

    def _load_env_vars(self):
        """Load environment variables into class attributes."""
        self.FRONTEND_URL = os.environ.get('FRONTEND_URL')
        self.SECRET_KEY = os.environ.get('SECRET_KEY')
        self.SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'True').lower() == 'true'
        self.SESSION_COOKIE_HTTPONLY = True
        self.SESSION_COOKIE_SAMESITE = 'Lax'

        # MongoDB
        self.MONGODB_HOST = os.environ.get('MONGODB_HOST')
        self.MONGODB_USERNAME = os.environ.get('MONGODB_USERNAME')
        self.MONGODB_PASSWORD = os.environ.get('MONGODB_PASSWORD')
        self.MONGODB_DB_NAME = os.environ.get('MONGODB_DB_NAME')

        # OpenAI
        self.OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

        # Auth0
        self.AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
        self.AUTH0_AUDIENCE = os.environ.get('AUTH0_AUDIENCE')
        self.ALGORITHM = os.environ.get('ALGORITHM', 'RS256')

    def _validate_env_vars(self):
        """Validate environment variables."""
        missing_vars = []

        # SECRET_KEY is critical for security
        if not self.SECRET_KEY:
            missing_vars.append('SECRET_KEY')
        elif len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")

        # Database configuration
        if not self.MONGODB_HOST:
            missing_vars.append('MONGODB_HOST')
        if not self.MONGODB_USERNAME:
            missing_vars.append('MONGODB_USERNAME')
        if not self.MONGODB_PASSWORD:
            missing_vars.append('MONGODB_PASSWORD')
        if not self.MONGODB_DB_NAME:
            missing_vars.append('MONGODB_DB_NAME')

        # OpenAI configuration
        if not self.OPENAI_API_KEY:
            missing_vars.append('OPENAI_API_KEY')

        # Auth0 configuration
        if not self.AUTH0_DOMAIN:
            missing_vars.append('AUTH0_DOMAIN')
        if not self.AUTH0_AUDIENCE:
            missing_vars.append('AUTH0_AUDIENCE')

        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")


class DevelopmentConfig(Config):
    """Development configuration."""

    def __init__(self):
        if os.path.exists('.env.development'):
            load_dotenv('.env.development')
        super().__init__()
        self.FLASK_ENV = 'development'
        self.FLASK_DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""

    def __init__(self):
        if os.path.exists('.env.production'):
            load_dotenv('.env.production')
        super().__init__()
        self.FLASK_ENV = 'production'
        self.FLASK_DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
