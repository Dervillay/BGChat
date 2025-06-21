#!/bin/bash

# BGChat Production Startup Script

echo "🚀 Starting BGChat in production mode..."

# Set environment variables for production
export FLASK_ENV=production
export REACT_APP_ENVIRONMENT=production

# Build frontend for production
echo "🔨 Building React app for production..."
cd frontend
npm run build
cd ..

# Start backend with Gunicorn for production
echo "🔧 Starting Flask backend with Gunicorn..."
cd backend
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 run:app
cd .. 