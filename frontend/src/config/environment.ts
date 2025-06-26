// Environment configuration for BGChat frontend

interface EnvironmentConfig {
  apiUrl: string;
  auth0Domain: string;
  auth0ClientId: string;
  auth0Audience: string;
  environment: 'development' | 'production';
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
  
  switch (environment) {
    case 'production':
      return {
        apiUrl: process.env.REACT_APP_API_URL || '',
        auth0Domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
        auth0ClientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
        auth0Audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
        environment: 'production'
      };
    
    default: // development
      return {
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
        auth0Domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
        auth0ClientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
        auth0Audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
        environment: 'development'
      };
  }
};

export const config = getEnvironmentConfig(); 