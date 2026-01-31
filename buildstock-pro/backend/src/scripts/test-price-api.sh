#!/bin/bash
#
# Integration Test Script for Price Scraping System
# Tests the complete flow: scrape -> save -> fetch -> verify
#

set -e  # Exit on error

BASE_URL="http://localhost:3001"
echo "=========================================="
echo "  Price Scraping Integration Tests"
echo "=========================================="
echo ""
echo "Backend URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    ((TESTS_FAILED++))
  fi
}

# Wait for server to be ready
echo -e "${YELLOW}Waiting for server to be ready...${NC}"
sleep 2

# Test 1: Health Check
echo ""
echo "Test 1: Health Check"
echo "----------------------------"
curl -s "$BASE_URL/health" | jq '.'
print_result $? "Health check endpoint"
echo ""

# Test 2: Trigger scrape (using mock data)
echo ""
echo "Test 2: Trigger Scrape Job"
echo "----------------------------"
echo "POST /api/prices/scrape"
SCRAPE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/prices/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "retailer": "screwfix",
    "category": "power-tools",
    "limit": 10,
    "useMockData": true
  }')
echo "$SCRAPE_RESPONSE" | jq '.'
SCRAPE_SUCCESS=$(echo "$SCRAPE_RESPONSE" | jq -r '.success')
print_result $? "Trigger scrape job"
echo ""

# Test 3: Get all prices
echo ""
echo "Test 3: Get All Prices"
echo "----------------------------"
echo "GET /api/prices"
PRICES_RESPONSE=$(curl -s "$BASE_URL/api/prices")
echo "$PRICES_RESPONSE" | jq '.'
print_result $? "Fetch all prices"
echo ""

# Test 4: Get prices by retailer
echo ""
echo "Test 4: Get Prices by Retailer"
echo "----------------------------"
echo "GET /api/prices/screwfix"
RETAILER_RESPONSE=$(curl -s "$BASE_URL/api/prices/screwfix")
echo "$RETAILER_RESPONSE" | jq '.'
print_result $? "Fetch prices by retailer"
echo ""

# Test 5: Get prices by category
echo ""
echo "Test 5: Get Prices by Category"
echo "----------------------------"
echo "GET /api/prices/screwfix/power-tools"
CATEGORY_RESPONSE=$(curl -s "$BASE_URL/api/prices/screwfix/power-tools")
echo "$CATEGORY_RESPONSE" | jq '.'
print_result $? "Fetch prices by category"
echo ""

# Test 6: Filter prices (in stock only)
echo ""
echo "Test 6: Filter Prices (In Stock)"
echo "----------------------------"
echo "GET /api/prices?inStock=true"
FILTERED_RESPONSE=$(curl -s "$BASE_URL/api/prices?inStock=true")
echo "$FILTERED_RESPONSE" | jq '.'
print_result $? "Filter prices by stock status"
echo ""

# Test 7: Filter prices (price range)
echo ""
echo "Test 7: Filter Prices (Price Range)"
echo "----------------------------"
echo "GET /api/prices?minPrice=10&maxPrice=100"
PRICE_RANGE_RESPONSE=$(curl -s "$BASE_URL/api/prices?minPrice=10&maxPrice=100")
echo "$PRICE_RANGE_RESPONSE" | jq '.'
print_result $? "Filter prices by range"
echo ""

# Test 8: Search products
echo ""
echo "Test 8: Search Products"
echo "----------------------------"
echo "GET /api/prices/search/drill"
SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/prices/search/drill")
echo "$SEARCH_RESPONSE" | jq '.'
print_result $? "Search products by name"
echo ""

# Test 9: Get statistics
echo ""
echo "Test 9: Get Statistics"
echo "----------------------------"
echo "GET /api/prices/stats"
STATS_RESPONSE=$(curl -s "$BASE_URL/api/prices/stats")
echo "$STATS_RESPONSE" | jq '.'
print_result $? "Fetch price statistics"
echo ""

# Test 10: Verify data integrity
echo ""
echo "Test 10: Data Integrity Check"
echo "----------------------------"
# Get a product from scrape results
PRODUCT_COUNT=$(echo "$SCRAPE_RESPONSE" | jq -r '.data.total // .data.products | length')
if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASS${NC}: Scrape returned $PRODUCT_COUNT products"
  ((TESTS_PASSED++))

  # Check if products are in the database
  DB_COUNT=$(echo "$PRICES_RESPONSE" | jq -r '.count // length')
  if [ "$DB_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: Database contains $DB_COUNT products"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}: No products found in database"
    ((TESTS_FAILED++))
  fi
else
  echo -e "${RED}✗ FAIL${NC}: Scrape returned no products"
  ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
