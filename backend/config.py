import os
from dotenv import load_dotenv


class Config:
    """Base configuration class."""

    def __init__(self):
        self._load_env_vars()

    def _load_env_vars(self):
        """Load environment variables into class attributes."""
        self.SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
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


class DevelopmentConfig(Config):
    """Development configuration."""

    def __init__(self):
        load_dotenv('.env.development')
        super().__init__()
        self.DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""

    def __init__(self):
        load_dotenv('.env.production')
        super().__init__()
        self.DEBUG = False


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
