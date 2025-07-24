# Docker Workflow Example

This example shows how Docker is integrated into the BACO workflow.

## 1. During Interactive Init

When you run `/baco init`, you'll be asked about Docker preferences:

```
🐳 Docker & Deployment Options:
☑ Generate Dockerfile for deployment
☑ Create docker-compose.yml for production
☑ Create docker-compose.dev.yml for development
☐ Generate Kubernetes manifests
☐ Include CI/CD workflows (GitHub Actions)

Would you like to change any of these? (y/N):
```

## 2. In Your baco.md

The Docker preferences are saved in your `baco.md` file:

```yaml
---
version: 1.0
project_type: "Next.js E-commerce Platform"
author: "Athena Chen"
created_at: "2024-01-21"
workflow:
  git_enabled: true
  auto_commit: true
  test_before_commit: true
  generate_tests: true
  docker_enabled: true          # Docker files will be generated
  docker_compose: true          # Production compose file
  docker_dev_config: true       # Development compose with hot reload
---
```

## 3. After Implementation Completes

When BACO finishes implementing your project:

```
🎉 All phases completed successfully!

🐳 Generating Docker configuration...

✅ Created optimized Dockerfile
✅ Created docker-compose.yml
✅ Created docker-compose.dev.yml

📦 Docker files generated:
- Dockerfile (multi-stage, optimized)
- docker-compose.yml (production)
- docker-compose.dev.yml (development with hot reload)
- .dockerignore

🚀 Quick Docker commands:
# Build and run locally:
docker build -t my-ecommerce-app .
docker run -p 3000:3000 my-ecommerce-app

# Or use docker-compose:
docker-compose up -d

# Development with hot reload:
docker-compose -f docker-compose.dev.yml up
```

## 4. Generated Dockerfile Example

For a Next.js app, BACO generates an optimized multi-stage Dockerfile:

```dockerfile
# Dependencies stage
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

CMD ["node", "server.js"]
```

## 5. Manual Docker Generation

You can also generate Docker files manually at any time:

```bash
# Generate Dockerfile only
/docker generate

# Generate with extra security
/docker generate --security

# Generate compose files
/docker compose --prod
/docker compose --dev

# Optimize existing Docker setup
/docker optimize
```

## Key Benefits

1. **Automatic Generation**: Docker files are created automatically based on your project type
2. **Framework-Specific**: Templates optimized for Next.js, Express, FastAPI, etc.
3. **Security by Default**: Non-root users, minimal images, health checks
4. **Development Ready**: Hot reload configurations for development
5. **Production Optimized**: Multi-stage builds, layer caching, small image sizes

## Customization

The Docker generator detects your framework and applies appropriate optimizations:

- **Next.js**: Standalone builds, static asset optimization
- **Express**: Node.js Alpine images, PM2 for production
- **Python/FastAPI**: Multi-stage builds with pip caching
- **React SPA**: Nginx serving with security headers

All templates follow Docker best practices and are production-ready!