# BACO/Pantheon Docker Makefile
# Provides convenient commands for Docker operations

.PHONY: help build up down restart logs shell auth status clean backup restore test

# Default target - show help
help:
	@echo "BACO/Pantheon Docker Commands"
	@echo "============================"
	@echo ""
	@echo "Basic Commands:"
	@echo "  make build      - Build the Docker image"
	@echo "  make up         - Start the container"
	@echo "  make down       - Stop and remove the container"
	@echo "  make restart    - Restart the container"
	@echo "  make logs       - View container logs"
	@echo ""
	@echo "Authentication:"
	@echo "  make auth       - Run Claude authentication"
	@echo "  make status     - Check authentication status"
	@echo "  make backup     - Backup authentication"
	@echo "  make restore    - Restore authentication"
	@echo ""
	@echo "Development:"
	@echo "  make shell      - Open shell in container"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean up volumes and images"
	@echo ""
	@echo "Combined Commands:"
	@echo "  make fresh      - Clean, build, and start"
	@echo "  make setup      - Build, start, and authenticate"

# Docker compose file
COMPOSE_FILE := docker/docker-compose.claude.yml
COMPOSE := docker-compose -f $(COMPOSE_FILE)

# Container name
CONTAINER := pantheon-ide

# Build the Docker image
build:
	@echo "🔨 Building BACO/Pantheon Docker image..."
	$(COMPOSE) build

# Start the container
up:
	@echo "🚀 Starting BACO/Pantheon container..."
	$(COMPOSE) up -d
	@echo ""
	@echo "✅ Container started!"
	@echo "📡 VS Code Server: http://localhost:8080"
	@echo ""
	@echo "Next steps:"
	@echo "1. Open http://localhost:8080 in your browser"
	@echo "2. Run 'make auth' to authenticate Claude"

# Stop and remove the container
down:
	@echo "🛑 Stopping BACO/Pantheon container..."
	$(COMPOSE) down

# Restart the container
restart:
	@echo "🔄 Restarting BACO/Pantheon container..."
	$(COMPOSE) restart

# View container logs
logs:
	@echo "📋 Container logs (Ctrl+C to exit):"
	$(COMPOSE) logs -f

# Open shell in container
shell:
	@echo "🐚 Opening shell in container..."
	docker exec -it $(CONTAINER) /bin/bash

# Run Claude authentication
auth:
	@echo "🔐 Running Claude authentication..."
	docker exec -it $(CONTAINER) claude-auth-docker.sh

# Check authentication status
status:
	@echo "📊 Checking Claude authentication status..."
	docker exec -it $(CONTAINER) claude-auth-status.sh

# Backup authentication
backup:
	@echo "💾 Backing up Claude authentication..."
	docker exec -it $(CONTAINER) claude-auth-helper.sh backup

# Restore authentication
restore:
	@echo "📥 Restoring Claude authentication..."
	docker exec -it $(CONTAINER) claude-auth-helper.sh restore

# Run tests
test:
	@echo "🧪 Running tests..."
	docker exec -it $(CONTAINER) gods test || echo "Note: Adjust this command based on your test setup"

# Clean up everything (WARNING: removes volumes!)
clean:
	@echo "⚠️  WARNING: This will remove all containers, images, and volumes!"
	@echo "Your project files in ./projects will be preserved."
	@read -p "Are you sure? (y/N): " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🧹 Cleaning up..."; \
		$(COMPOSE) down -v --rmi all; \
		echo "✅ Cleanup complete!"; \
	else \
		echo "❌ Cleanup cancelled."; \
	fi

# Fresh start - clean, build, and start
fresh: clean build up
	@echo "🎉 Fresh environment ready!"

# Complete setup - build, start, and authenticate
setup: build up
	@echo ""
	@echo "⏳ Waiting for container to be ready..."
	@sleep 5
	@$(MAKE) auth

# Development environment check
check-env:
	@echo "🔍 Checking environment..."
	@if [ ! -f docker/.env ]; then \
		echo "❌ docker/.env not found!"; \
		echo "Creating from template..."; \
		cp docker/.env.example docker/.env; \
		echo "✅ Created docker/.env - please edit it with your settings"; \
	else \
		echo "✅ docker/.env exists"; \
	fi
	@if command -v docker-compose >/dev/null 2>&1; then \
		echo "✅ docker-compose is installed"; \
	else \
		echo "❌ docker-compose is not installed"; \
		echo "Please install Docker and docker-compose first"; \
		exit 1; \
	fi

# Quick start guide
quickstart: check-env
	@echo ""
	@echo "🚀 BACO/Pantheon Quick Start"
	@echo "=========================="
	@echo ""
	@echo "1. Edit docker/.env and set your VS_CODE_PASSWORD"
	@echo "2. Run: make setup"
	@echo "3. Open: http://localhost:8080"
	@echo "4. Enjoy coding with BACO/Pantheon!"

# Show container stats
stats:
	@echo "📊 Container Statistics:"
	@docker stats --no-stream $(CONTAINER)

# Show disk usage
disk-usage:
	@echo "💾 Docker Disk Usage:"
	@docker system df -v | grep -E "(VOLUME NAME|pantheon-)"

# Backup volumes to local directory
backup-volumes:
	@echo "💾 Backing up Docker volumes..."
	@mkdir -p backups
	@docker run --rm \
		-v pantheon-claude-auth:/source/claude-auth \
		-v pantheon-vscode-config:/source/vscode-config \
		-v $(PWD)/backups:/backup \
		alpine tar czf /backup/pantheon-volumes-$$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
	@echo "✅ Backup saved to backups/"

# Restore volumes from backup
restore-volumes:
	@echo "📥 Available backups:"
	@ls -la backups/*.tar.gz 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup filename (or press Enter to cancel): " backup && \
	if [ -n "$$backup" ] && [ -f "backups/$$backup" ]; then \
		echo "Restoring from $$backup..."; \
		docker run --rm \
			-v pantheon-claude-auth:/target/claude-auth \
			-v pantheon-vscode-config:/target/vscode-config \
			-v $(PWD)/backups:/backup \
			alpine tar xzf /backup/$$backup -C /target; \
		echo "✅ Restore complete!"; \
	else \
		echo "❌ Restore cancelled."; \
	fi

# Update the Docker image
update:
	@echo "🔄 Updating BACO/Pantheon..."
	git pull
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d
	@echo "✅ Update complete!"

# Show version information
version:
	@echo "BACO/Pantheon Version Information:"
	@echo "================================="
	@docker exec $(CONTAINER) gods --version 2>/dev/null || echo "Gods CLI version: Not available"
	@docker exec $(CONTAINER) claude --version 2>/dev/null || echo "Claude CLI version: Not available"
	@docker exec $(CONTAINER) node --version | sed 's/^/Node.js: /'
	@docker exec $(CONTAINER) python3 --version | sed 's/^//'
	@docker exec $(CONTAINER) code-server --version | head -1 | sed 's/^/VS Code Server: /'