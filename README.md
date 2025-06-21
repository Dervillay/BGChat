# BGChat Development & Production Setup

This guide explains how to run BGChat in development and production modes.

## 🏗️ Architecture Overview

- **Frontend**: React app (port 3000 in dev, built static files in prod)
- **Backend**: Flask API (port 5000)
- **Database**: MongoDB
- **Authentication**: Auth0

## 🚀 Quick Start

### Development Mode
```bash
# Make scripts executable
chmod +x start-dev.sh start-prod.sh

# Start development servers
./start-dev.sh
```

### Production Mode
```bash
# Start production servers
./start-prod.sh
```

## 📁 Environment Configuration

### Backend Environment Files

Create these files in the `backend/` directory:

#### `.env.development`
```env
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=run.py

# Database
MONGODB_HOST=your-dev-mongodb-host
MONGODB_USERNAME=your-dev-username
MONGODB_PASSWORD=your-dev-password
MONGODB_DB_NAME=bgchat_dev

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Auth0
AUTH0_DOMAIN=your-dev-auth0-domain
AUTH0_AUDIENCE=your-dev-audience
ALGORITHM=RS256

# Security
SECRET_KEY=dev-secret-key-change-in-production
SESSION_COOKIE_SECURE=False
```

#### `.env.production`
```env
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_APP=run.py

# Database
MONGODB_HOST=your-prod-mongodb-host
MONGODB_USERNAME=your-prod-username
MONGODB_PASSWORD=your-prod-password
MONGODB_DB_NAME=bgchat_prod

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Auth0
AUTH0_DOMAIN=your-prod-auth0-domain
AUTH0_AUDIENCE=your-prod-audience
ALGORITHM=RS256

# Security
SECRET_KEY=your-secure-production-secret-key
SESSION_COOKIE_SECURE=True
```

### Frontend Environment Files

Create these files in the `frontend/` directory:

#### `.env.development`
```env
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=your-dev-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-dev-client-id
REACT_APP_AUTH0_AUDIENCE=your-dev-audience
```

#### `.env.production`
```env
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://your-production-api.com
REACT_APP_AUTH0_DOMAIN=your-prod-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-prod-client-id
REACT_APP_AUTH0_AUDIENCE=your-prod-audience
```

## 🔧 Manual Setup

### Development Mode

#### Backend
```bash
cd backend
export FLASK_ENV=development
python3 run.py
```

#### Frontend
```bash
cd frontend
export REACT_APP_ENVIRONMENT=development
npm start
```

### Production Mode

#### Backend
```bash
cd backend
export FLASK_ENV=production
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 run:app
```

#### Frontend
```bash
cd frontend
export REACT_APP_ENVIRONMENT=production
npm run build
# Serve the build folder with a web server like nginx
```

## 🌍 Environment Variables

### Backend Variables
- `FLASK_ENV`: Environment name (development/production/testing)
- `MONGODB_*`: MongoDB connection details
- `OPENAI_API_KEY`: OpenAI API key
- `AUTH0_*`: Auth0 configuration
- `SECRET_KEY`: Flask secret key
- `SESSION_COOKIE_SECURE`: HTTPS requirement for cookies

### Frontend Variables
- `REACT_APP_ENVIRONMENT`: Environment name
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_AUTH0_*`: Auth0 configuration

## 📝 Best Practices

1. **Never commit `.env` files** - Add them to `.gitignore`
2. **Use different databases** for dev/prod
3. **Use different Auth0 applications** for dev/prod
4. **Set secure secret keys** in production
5. **Enable HTTPS** in production
6. **Use environment variables** for all configuration
7. **Test production builds** locally before deployment

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5000 are available
2. **Environment variables**: Check that all required variables are set
3. **Database connection**: Verify MongoDB connection details
4. **Auth0 configuration**: Ensure Auth0 settings match environment

### Debug Mode
- Backend: Check Flask debug output
- Frontend: Check browser console and network tab
- Environment: Verify environment variables are loaded correctly 