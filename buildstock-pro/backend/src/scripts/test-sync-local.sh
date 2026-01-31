#!/bin/bash
# Test script for price sync
# Run locally to verify sync-prices works before enabling GitHub Actions

set -e  # Exit on error

echo "========================================="
echo "  BuildStock Pro - Price Sync Test"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found"
  echo ""
  echo "Please create .env file with:"
  echo "  DATABASE_URL=postgresql://..."
  echo "  SUPABASE_URL=https://..."
  echo "  SUPABASE_SERVICE_ROLE_KEY=..."
  echo ""
  exit 1
fi

# Load environment variables
echo "📝 Loading environment variables from .env..."
set -a  # Automatically export all variables
source .env
set +a

# Verify required variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: Required environment variables not set"
  echo ""
  echo "Required variables:"
  echo "  ✓ DATABASE_URL"
  echo "  ✓ SUPABASE_URL"
  echo "  ✓ SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo "Please check your .env file"
  exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
  echo "❌ Error: bun is not installed"
  echo ""
  echo "Install bun: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# Ask if test should use mock data
echo "🧪 Test Configuration"
echo "===================="
echo ""
read -p "Use mock data for testing? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  export USE_MOCK_DATA=true
  echo "✅ Will use mock data"
else
  export USE_MOCK_DATA=false
  echo "⚠️  Will use REAL scraping (respects rate limits!)"
fi
echo ""

# Show current configuration
echo "📊 Current Configuration"
echo "======================="
echo ""
echo "Database URL: ${DATABASE_URL:0:50}..."
echo "Supabase URL: $SUPABASE_URL"
echo "Use Mock Data: $USE_MOCK_DATA"
echo ""

# Confirm before running
read -p "Ready to test price sync? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 0
fi

echo ""
echo "========================================="
echo "  Starting Price Sync Test"
echo "========================================="
echo ""

# Run the sync script
bun run src/scripts/sync-prices

# Capture exit code
EXIT_CODE=$?

echo ""
echo "========================================="
echo "  Test Complete"
echo "========================================="
echo ""

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ SUCCESS: Price sync completed successfully"
  echo ""
  echo "Next steps:"
  echo "  1. Verify data in Supabase dashboard"
  echo "  2. Test again without mock data if needed"
  echo "  3. Enable GitHub Actions workflow"
  echo ""
else
  echo "❌ FAILED: Price sync encountered errors"
  echo ""
  echo "Check the logs above for error details"
  echo "Common issues:"
  echo "  - Database connection failed (check DATABASE_URL)"
  echo "  - Scraper blocked (check robots.txt)"
  echo "  - Rate limit exceeded (wait longer between runs)"
  echo ""
fi

exit $EXIT_CODE
