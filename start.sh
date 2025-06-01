#!/bin/bash
gnome-terminal --title="Backend Server" -- bash -c "cd backend && source myenv/bin/activate && trap 'kill $(jobs -p)' EXIT && python run.py; exec bash"
gnome-terminal --title="Frontend Server" -- bash -c "cd frontend && trap 'kill $(jobs -p)' EXIT && npm start; exec bash"