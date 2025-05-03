#!/bin/bash

# Start backend
cd backend
source myenv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for both to finish
wait $BACKEND_PID
wait $FRONTEND_PID