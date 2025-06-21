#!/bin/bash

# BGChat Development Startup Script

echo "🚀 Starting BGChat in development mode..."

# Set environment variables for development
export FLASK_ENV=development
export REACT_APP_ENVIRONMENT=development

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend server with virtual environment
echo "🔧 Starting Flask backend server..."
cd backend
source myenv/bin/activate
python3 run.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend development server
echo "⚛️  Starting React development server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait 