#!/bin/bash

# Start FastAPI backend in background
echo "🚀 Starting FastAPI backend..."
uvicorn app.main:app --host 0.0.0.0 --port 3000 &

# Wait a moment for FastAPI to start
sleep 3

# Start nginx for frontend
echo "🌐 Starting Nginx frontend server..."
nginx -g "daemon off;" &

# Keep container running and show logs
echo "✅ Services started successfully!"
echo "📡 API available on port 3000"
echo "🌐 Frontend available on port 80"
echo "📋 Monitoring logs..."

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
