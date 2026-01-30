#!/bin/bash

# BuildStock Pro - Health Check Script
# This script tests all critical components of the application
# Usage: ./health-check.sh [--verbose]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-https://buildstock-api.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://buildstock-pro.vercel.app}"
VERBOSE=false

# Check for verbose flag
if [ "$1" == "--verbose" ]; then
  VERBOSE=true
fi

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${YELLOW}[TEST $TOTAL_CHECKS]${NC} $1"
}

print_pass() {
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo -e "${GREEN}✓ PASS${NC}: $1"
    if [ "$VERBOSE" = true ] && [ -n "$2" ]; then
        echo -e "${GREEN}  Details: $2${NC}"
    fi
}

print_fail() {
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo -e "${RED}✗ FAIL${NC}: $1"
    if [ "$VERBOSE" = true ] && [ -n "$2" ]; then
        echo -e "${RED}  Details: $2${NC}"
    fi
}

check_endpoint() {
    local url=$1
    local expected_status=$2
    local test_name=$3

    print_test "$test_name"

    response=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" 2>&1)

    if [ "$response" = "$expected_status" ]; then
        print_pass "$test_name" "HTTP $response"
        return 0
    else
        print_fail "$test_name" "Expected HTTP $expected_status, got HTTP $response"
        return 1
    fi
}

check_json_endpoint() {
    local url=$1
    local field=$2
    local expected_value=$3
    local test_name=$4

    print_test "$test_name"

    response=$(curl -s "$url" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")

    if [ "$http_code" != "200" ]; then
        print_fail "$test_name" "HTTP $http_code"
        return 1
    fi

    # Extract field value using grep/sed
    value=$(echo "$response" | grep -o "\"$field\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*: *"\([^"]*\)".*/\1/')

    if [ "$value" = "$expected_value" ]; then
        print_pass "$test_name" "$field = $value"
        return 0
    else
        print_fail "$test_name" "Expected $field = '$expected_value', got '$value'"
        return 1
    fi
}

check_response_time() {
    local url=$1
    local max_time=$2
    local test_name=$3

    print_test "$test_name"

    start_time=$(date +%s%3N)
    response=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" 2>&1)
    end_time=$(date +%s%3N)

    elapsed=$((end_time - start_time))

    if [ "$elapsed" -le "$max_time" ]; then
        print_pass "$test_name" "${elapsed}ms (max: ${max_time}ms)"
        return 0
    else
        print_fail "$test_name" "${elapsed}ms (max: ${max_time}ms)"
        return 1
    fi
}

# Main execution
main() {
    print_header "BuildStock Pro - Health Check"
    echo "API URL: $API_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

    # Backend Health Checks
    print_header "Backend Health Checks"

    # 1. Root endpoint
    check_json_endpoint "$API_URL/" "success" "true" "Backend root endpoint"

    # 2. Health endpoint
    check_json_endpoint "$API_URL/health" "status" "healthy" "Backend health endpoint"

    # 3. API version endpoint
    check_json_endpoint "$API_URL/api/v1" "success" "true" "API version endpoint"

    # 4. Products endpoint
    check_endpoint "$API_URL/api/products" "200" "Products list endpoint"

    # 5. Search endpoint
    check_endpoint "$API_URL/api/v1/search?q=test" "200" "Search endpoint"

    # 6. Categories endpoint
    check_endpoint "$API_URL/api/products/meta/categories" "200" "Categories endpoint"

    # 7. Brands endpoint
    check_endpoint "$API_URL/api/products/meta/brands" "200" "Brands endpoint"

    # Frontend Health Checks
    print_header "Frontend Health Checks"

    # 8. Frontend homepage
    check_endpoint "$FRONTEND_URL/" "200" "Frontend homepage"

    # 9. Frontend products page
    check_endpoint "$FRONTEND_URL/products" "200" "Frontend products page"

    # Performance Checks
    print_header "Performance Checks"

    # 10. Backend response time
    check_response_time "$API_URL/health" 2000 "Backend response time"

    # 11. Frontend response time
    check_response_time "$FRONTEND_URL/" 3000 "Frontend response time"

    # Database Connection Check (if API is accessible)
    print_header "Database Connectivity"

    print_test "Database connection via API"
    db_response=$(curl -s "$API_URL/api/products?limit=1" 2>&1)
    db_http_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_URL/api/products?limit=1")

    if [ "$db_http_code" = "200" ]; then
        # Check if response contains data
        if echo "$db_response" | grep -q "success"; then
            print_pass "Database connection" "API can query database"
        else
            print_fail "Database connection" "API returned unexpected response"
        fi
    else
        print_fail "Database connection" "HTTP $db_http_code"
    fi

    # Summary
    print_header "Health Check Summary"
    echo -e "Total Checks: $TOTAL_CHECKS"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "\n${GREEN}All health checks passed! ✓${NC}\n"
        exit 0
    else
        echo -e "\n${RED}Some health checks failed! ✗${NC}\n"
        exit 1
    fi
}

# Run main function
main
