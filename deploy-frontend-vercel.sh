#!/bin/bash

# BuildStock Pro Frontend - Vercel Deployment Script
# Guides you through deploying the frontend to Vercel

set -e

FRONTEND_DIR="/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend"
cd "$FRONTEND_DIR"

echo "========================================"
echo "BuildStock Pro Frontend - Vercel Deploy"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Vercel CLI is installed
echo -e "${BLUE}Step 1: Check Vercel CLI${NC}"
echo "==========================="
echo ""

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✓ Vercel CLI already installed${NC}"
fi
echo ""

# Check for backend URL
echo -e "${BLUE}Step 2: Backend Configuration${NC}"
echo "=================================="
echo ""

# Check if we have a saved backend URL
if [ -f "../.render_backend_url" ]; then
    BACKEND_URL=$(cat ../.render_backend_url)
    echo -e "${GREEN}Found backend URL: $BACKEND_URL${NC}"
    read -p "Use this backend URL? (y/n): " USE_SAVED
    if [ "$USE_SAVED" != "y" ]; then
        BACKEND_URL=""
    fi
fi

if [ -z "$BACKEND_URL" ]; then
    echo "Enter your backend URL:"
    read -p "Backend URL (e.g., https://buildstock-backend.onrender.com): " BACKEND_URL
fi

echo ""
echo -e "${GREEN}Using backend: $BACKEND_URL${NC}"
echo ""

# Check environment files
echo -e "${BLUE}Step 3: Environment Variables${NC}"
echo "================================"
echo ""

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybmsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczODA1NjQ0MiwiZXhwIjoyMDUzNjMyNDQyfQ.DN2P4Fa0_s4fQQwWqA2iZuHg1hGkVgEzW4bJeh5p3Ks
EOF
    echo -e "${GREEN}✓ .env.local created${NC}"
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
    echo ""
    echo "Current NEXT_PUBLIC_API_URL:"
    grep "NEXT_PUBLIC_API_URL" .env.local || echo "Not set"
    echo ""
    read -p "Update NEXT_PUBLIC_API_URL to $BACKEND_URL? (y/n): " UPDATE_ENV
    if [ "$UPDATE_ENV" == "y" ]; then
        if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
            sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL|" .env.local
        else
            echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" >> .env.local
        fi
        echo -e "${GREEN}✓ Environment updated${NC}"
    fi
fi
echo ""

# Build check
echo -e "${BLUE}Step 4: Build Check${NC}"
echo "======================"
echo ""

echo "Running production build..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Please fix build errors before deploying"
    exit 1
fi
echo ""

# Deploy to Vercel
echo -e "${BLUE}Step 5: Deploy to Vercel${NC}"
echo "==========================="
echo ""

echo -e "${YELLOW}Note: Vercel requires interactive authentication${NC}"
echo ""
echo "The Vercel CLI will now:"
echo "  1. Open your browser for authentication"
echo "  2. Ask you to confirm deployment settings"
echo "  3. Deploy your frontend"
echo ""

read -p "Press Enter to continue to Vercel deployment..."

echo ""
echo -e "${BLUE}Starting Vercel deployment...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get the deployed URL
echo "Your frontend is now live on Vercel!"
echo ""
echo "Next Steps:"
echo "1. Copy your Vercel URL from above"
echo "2. Update CORS_ORIGIN in Render backend:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Open your backend service"
echo "   - Add environment variable: CORS_ORIGIN=https://your-frontend.vercel.app"
echo "   - Trigger a new deployment"
echo ""
echo "3. Test your deployment:"
echo "   - Open your frontend URL"
echo "   - Try searching for products"
echo "   - Test all critical flows"
echo ""
echo "4. Run beta testing checklist:"
echo "   See: BETA_TESTING_CHECKLIST.md"
echo ""

# Save backend URL for reference
echo "$BACKEND_URL" > .vercel_backend_url
echo "Backend URL saved to: .vercel_backend_url"
echo ""
