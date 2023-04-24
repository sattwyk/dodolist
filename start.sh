#!/bin/bash

# Start frontend server on port 3000
cd frontend
echo "Starting frontend server on port 3000..."
npm run dev -- --port 3000 &
cd ..

# Start backend server with Gunicorn on port 5000
cd backend
echo "Activating virtual environment..."
source ./venv/bin/activate


echo "Starting backend server with Flask on port 5000..."
# gunicorn -b 127.0.0.1:5000 main:app
python main.py
