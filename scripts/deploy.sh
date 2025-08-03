#!/bin/bash

# Pantheon Multi-AI Ecosystem - Production Deployment Script
# This script handles deployment to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
DEPLOY_METHOD=${3:-docker}

echo -e "${GREEN}🏛️ Pantheon Multi-AI Ecosystem Deployment${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"
echo -e "${YELLOW}Method: $DEPLOY_METHOD${NC}"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed${NC}"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env" ]; then
        echo -e "${RED}.env file not found${NC}"
        echo "Please copy .env.example to .env and configure"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Prerequisites met${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    npm test
    echo -e "${GREEN}✓ Tests passed${NC}"
}

# Function to build application
build_application() {
    echo -e "${YELLOW}Building application...${NC}"
    
    # Install dependencies
    npm ci --production
    
    # Run build if script exists
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        npm run build
    fi
    
    echo -e "${GREEN}✓ Build complete${NC}"
}

# Function to deploy with Docker
deploy_docker() {
    echo -e "${YELLOW}Deploying with Docker...${NC}"
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p .claude/logs .claude/state .claude/reports

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["npm", "start"]
EOF
    fi
    
    # Build Docker image
    docker build -t pantheon-ai:$VERSION .
    
    # Stop existing container if running
    docker stop pantheon-ai 2>/dev/null || true
    docker rm pantheon-ai 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name pantheon-ai \
        --restart unless-stopped \
        -p 3000:3000 \
        -p 3001:3001 \
        -v $(pwd)/.claude:/app/.claude \
        --env-file .env \
        pantheon-ai:$VERSION
    
    echo -e "${GREEN}✓ Docker deployment complete${NC}"
}

# Function to deploy with PM2
deploy_pm2() {
    echo -e "${YELLOW}Deploying with PM2...${NC}"
    
    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pantheon-ai',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './.claude/logs/pm2-error.log',
    out_file: './.claude/logs/pm2-out.log',
    log_file: './.claude/logs/pm2-combined.log',
    time: true
  }]
};
EOF
    
    # Stop existing PM2 process if running
    pm2 stop pantheon-ai 2>/dev/null || true
    pm2 delete pantheon-ai 2>/dev/null || true
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 process list
    pm2 save
    
    # Setup startup script
    pm2 startup
    
    echo -e "${GREEN}✓ PM2 deployment complete${NC}"
}

# Function to deploy to Kubernetes
deploy_kubernetes() {
    echo -e "${YELLOW}Deploying to Kubernetes...${NC}"
    
    # Create k8s directory if it doesn't exist
    mkdir -p k8s
    
    # Create deployment manifest
    cat > k8s/deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pantheon-ai
  labels:
    app: pantheon-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pantheon-ai
  template:
    metadata:
      labels:
        app: pantheon-ai
    spec:
      containers:
      - name: pantheon-ai
        image: pantheon-ai:$VERSION
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: pantheon-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
EOF
    
    # Create service manifest
    cat > k8s/service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: pantheon-ai
spec:
  selector:
    app: pantheon-ai
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: mcp
    port: 3001
    targetPort: 3001
  type: LoadBalancer
EOF
    
    # Create secrets from .env file
    kubectl create secret generic pantheon-secrets --from-env-file=.env --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply manifests
    kubectl apply -f k8s/
    
    echo -e "${GREEN}✓ Kubernetes deployment complete${NC}"
}

# Function to run health check
health_check() {
    echo -e "${YELLOW}Running health check...${NC}"
    
    # Wait for service to be ready
    sleep 5
    
    # Check health endpoint
    if curl -f http://localhost:3000/health &>/dev/null; then
        echo -e "${GREEN}✓ Health check passed${NC}"
    else
        echo -e "${RED}✗ Health check failed${NC}"
        exit 1
    fi
}

# Function to setup monitoring
setup_monitoring() {
    echo -e "${YELLOW}Setting up monitoring...${NC}"
    
    # Create monitoring script
    cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
while true; do
    # Check if service is running
    if curl -f http://localhost:3000/health &>/dev/null; then
        echo "$(date): Service is healthy"
    else
        echo "$(date): Service is unhealthy - attempting restart"
        npm start &
    fi
    
    # Check disk space
    DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 80 ]; then
        echo "$(date): Warning - Disk usage is ${DISK_USAGE}%"
    fi
    
    # Check memory usage
    MEM_USAGE=$(free | awk '/^Mem/ {printf("%.0f", $3/$2 * 100)}')
    if [ $MEM_USAGE -gt 80 ]; then
        echo "$(date): Warning - Memory usage is ${MEM_USAGE}%"
    fi
    
    sleep 60
done
EOF
    
    chmod +x scripts/monitor.sh
    
    echo -e "${GREEN}✓ Monitoring setup complete${NC}"
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup configuration
    cp -r .claude/configs $BACKUP_DIR/
    cp .env $BACKUP_DIR/
    
    # Backup state
    if [ -d ".claude/state" ]; then
        cp -r .claude/state $BACKUP_DIR/
    fi
    
    # Create tar archive
    tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
    rm -rf $BACKUP_DIR
    
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR.tar.gz${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}Starting deployment process...${NC}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    create_backup
    
    # Run tests
    if [ "$ENVIRONMENT" = "production" ]; then
        run_tests
    fi
    
    # Build application
    build_application
    
    # Deploy based on method
    case $DEPLOY_METHOD in
        docker)
            deploy_docker
            ;;
        pm2)
            deploy_pm2
            ;;
        kubernetes|k8s)
            deploy_kubernetes
            ;;
        *)
            echo -e "${RED}Unknown deployment method: $DEPLOY_METHOD${NC}"
            echo "Supported methods: docker, pm2, kubernetes"
            exit 1
            ;;
    esac
    
    # Run health check
    health_check
    
    # Setup monitoring
    setup_monitoring
    
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${YELLOW}Access the application:${NC}"
    echo "  - Main: http://localhost:3000"
    echo "  - Dashboard: http://localhost:3000/dashboard"
    echo "  - MCP Server: http://localhost:3001"
    echo ""
    echo -e "${YELLOW}Monitor logs:${NC}"
    
    case $DEPLOY_METHOD in
        docker)
            echo "  docker logs -f pantheon-ai"
            ;;
        pm2)
            echo "  pm2 logs pantheon-ai"
            ;;
        kubernetes)
            echo "  kubectl logs -f deployment/pantheon-ai"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
}

# Handle cleanup on exit
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
}

trap cleanup EXIT

# Run main function
main