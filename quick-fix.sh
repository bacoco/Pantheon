#!/bin/bash
# Quick fix script to restart container without rebuilding

echo "🔧 Applying quick fix..."

# Stop container
docker stop pantheon-ide

# Copy the fixed entrypoint script into the container
docker cp scripts/docker-entrypoint.sh pantheon-ide:/usr/local/bin/docker-entrypoint.sh

# Start container again
docker start pantheon-ide

echo "✅ Fix applied! Waiting for VS Code Server..."
sleep 5

# Check if it's working
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|302"; then
    echo "✅ VS Code Server is ready at http://localhost:8080"
else
    echo "❌ Still having issues. Checking logs..."
    docker logs pantheon-ide --tail 10
fi