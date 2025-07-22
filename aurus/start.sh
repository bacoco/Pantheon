#!/bin/bash

# Aurus - SBF 250 Portfolio Analyzer
# Startup script for development

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 Starting Aurus Portfolio Analyzer..."
echo "📁 Working directory: $SCRIPT_DIR"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+"
    exit 1
fi

# Check if ports are already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Killing existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Killing existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend
echo "📦 Starting backend server..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    echo "Please run this script from the aurus project root directory"
    exit 1
fi

cd backend

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
pip install -q -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "✅ Backend running at http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."

# Go back to project root first
cd "$SCRIPT_DIR"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    echo "Project structure seems incorrect"
    exit 1
fi

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start React app
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Frontend will open at http://localhost:3000"
echo ""
echo "🎉 Aurus is running! Press Ctrl+C to stop all services."
echo ""
echo "📝 First time? Click 'Update All Data' in the web app to fetch SBF 250 stocks."
echo ""

# Wait for processes
wait