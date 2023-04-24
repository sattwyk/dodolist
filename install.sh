#!/bin/bash

# Install frontend dependencies
echo "Installing frontend packages..."
cd frontend
npm install

# Install backend dependencies
cd ../backend
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source ./venv/bin/activate


echo "Installing required Python packages..."
pip install -r requirements.txt
