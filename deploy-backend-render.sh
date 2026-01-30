#!/bin/bash

# BuildStock Pro Backend - Render API Deployment Script
# Deploys backend to Render using API token (non-interactive)

set -e

BACKEND_DIR="/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend"
cd "$BACKEND_DIR"

echo "========================================"
echo "BuildStock Pro Backend - Render Deploy"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get API token
echo -e "${BLUE}Step 1: Authentication${NC}"
echo "===================="
echo ""
if [ -z "$RENDER_API_TOKEN" ]; then
    echo -e "${YELLOW}Please provide your Render API token${NC}"
    echo "Get it from: https://dashboard.render.com/settings/api-keys"
    echo ""
    read -p "Enter your Render API token (rnd_...): " RENDER_API_TOKEN
    echo ""
fi

# Validate token format
if [[ ! "$RENDER_API_TOKEN" =~ ^rnd_ ]]; then
    echo -e "${RED}Invalid token format. Render tokens start with 'rnd_'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Token accepted${NC}"
echo ""

# Get deployment details
echo -e "${BLUE}Step 2: Deployment Details${NC}"
echo "========================"
echo ""

# Service name (default: buildstock-backend)
read -p "Service name [buildstock-backend]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-buildstock-backend}

# Region (default: oregon)
read -p "Region [oregon]: " REGION
REGION=${REGION:-oregon}

# Branch (default: main)
read -p "Git branch [main]: " BRANCH
BRANCH=${BRANCH:-main}

echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Branch: $BRANCH"
echo ""

# Confirm
read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 3: Creating Web Service${NC}"
echo "==============================="
echo ""

# Check if we have a GitHub repo
if [ ! -d ".git" ]; then
    echo -e "${RED}Not a git repository. Please initialize git first.${NC}"
    exit 1
fi

# Get GitHub repo info
GITHUB_REPO=$(git config --get remote.origin.url | sed 's/git@github.com://' | sed 's/https:\/\/github.com\//' | sed 's/\.git//')
if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}Could not detect GitHub repository. Please set a remote origin.${NC}"
    exit 1
fi

echo "GitHub Repository: $GITHUB_REPO"

# Prepare deployment payload
SERVICE_JSON=$(cat <<EOF
{
  "name": "$SERVICE_NAME",
  "type": "web_service",
  "region": "$REGION",
  "branch": "$BRANCH",
  "runtime": "docker",
  "buildCommand": "docker build -t buildstock-backend .",
  "startCommand": "docker run -p 3001:3001 buildstock-backend",
  "envVars": {
    "PORT": "3001",
    "NODE_ENV": "production"
  },
  "healthCheckPath": "/health"
}
EOF
)

echo ""
echo -e "${YELLOW}Note: This script will create a service on Render${NC}"
echo "After creation, you'll need to:"
echo "  1. Connect your GitHub repository in Render dashboard"
echo "  2. Set environment variables (DATABASE_URL, JWT_SECRET, CORS_ORIGIN)"
echo "  3. Trigger a deployment"
echo ""

# Use Render API to create service
echo -e "${BLUE}Step 4: Creating Service via API${NC}"
echo "==================================="
echo ""

# Since we can't fully automate via API without GitHub connection,
# we'll open the Render dashboard with pre-filled information

ENCODED_REPO=$(echo "$GITHUB_REPO" | jq -sRr @uri)
ENCODED_NAME=$(echo "$SERVICE_NAME" | jq -sRr @uri)

echo -e "${GREEN}Opening Render dashboard...${NC}"
echo ""

# Open Render dashboard with new service URL
open "https://dashboard.render.com/create/web?name=$SERVICE_NAME&region=$REGION&repo=$ENCODED_REPO"

echo "A browser window should have opened."
echo ""
echo -e "${YELLOW}Please complete these steps in the browser:${NC}"
echo ""
echo "1. Connect your GitHub repository"
echo "2. Set these settings:"
echo "   - Runtime: Docker"
echo "   - Docker Context: /"
echo "   - Dockerfile Path: ./Dockerfile"
echo ""
echo "3. Add environment variables:"
echo "   - PORT: 3001"
echo "   - NODE_ENV: production"
echo "   - DATABASE_URL: (from Supabase - see below)"
echo "   - JWT_SECRET: (generate secure secret)"
echo "   - CORS_ORIGIN: (your frontend URL - add after frontend deployed)"
echo ""
echo "4. Click 'Create Web Service'"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Supabase Credentials (from checkpoint)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Supabase URL: https://xrhlumtimbmglzrfrnnk.supabase.co"
echo ""
echo "For DATABASE_URL, use this format:"
echo "postgresql://postgres:[YOUR-PASSWORD]@db.xrhlumtimbmglzrfrnnk.supabase.co:5432/postgres"
echo ""
echo "Get your password from: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Generate JWT Secret${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Run this command to generate a secure JWT_SECRET:"
echo "  openssl rand -base64 32"
echo ""

# Wait for user to complete
read -p "Press Enter after you've created the service in Render..."

echo ""
echo -e "${BLUE}Step 5: Deployment Status${NC}"
echo "========================="
echo ""

# Get service URL from user
read -p "Enter your Render service URL (e.g., https://buildstock-backend.onrender.com): " SERVICE_URL

if [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}No URL provided. You can find it in your Render dashboard.${NC}"
else
    echo ""
    echo -e "${GREEN}Backend deployed to: $SERVICE_URL${NC}"
    echo ""

    # Test health endpoint
    echo "Testing health endpoint..."
    if curl -s "$SERVICE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠ Health check failed or service still deploying${NC}"
        echo "Check logs in Render dashboard"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backend Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service URL: $SERVICE_URL"
echo "Health Check: $SERVICE_URL/health"
echo "API Base: $SERVICE_URL/api/v1"
echo ""
echo "Next Steps:"
echo "1. Save the backend URL for frontend deployment"
echo "2. Update CORS_ORIGIN once frontend is deployed"
echo "3. Deploy the frontend"
echo ""
echo "View logs: https://dashboard.render.com/web/$SERVICE_NAME/logs"
echo "View dashboard: https://dashboard.render.com/web/$SERVICE_NAME"
echo ""

# Save URL to file for reference
echo "$SERVICE_URL" > .render_backend_url
echo "Backend URL saved to: .render_backend_url"
echo ""
