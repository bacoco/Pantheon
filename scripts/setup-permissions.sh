#!/bin/bash
# setup-permissions.sh - Ensure all scripts have correct permissions

echo "Setting up permissions for BACO scripts..."

# Make all scripts executable
chmod +x scripts/*.sh 2>/dev/null
chmod +x start-docker.sh 2>/dev/null
chmod +x Makefile 2>/dev/null

echo "✅ Permissions set successfully!"
echo ""
echo "Executable scripts:"
echo "  Root directory:"
ls -la start-docker.sh 2>/dev/null || echo "    start-docker.sh not found"
echo ""
echo "  Scripts directory:"
ls -la scripts/*.sh 2>/dev/null
echo ""
echo "You can now run: ./start-docker.sh"