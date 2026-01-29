#!/bin/bash

################################################################################
# BuildStock Pro - Beta Testing Automated Test Suite
################################################################################
# Description: Comprehensive automated testing script for beta releases
# Usage: ./test-beta.sh [options]
#
# Options:
#   -v, --verbose     Enable verbose output
#   -q, --quiet       Suppress non-error output
#   -f, --fail-fast   Stop on first failure
#   -h, --help        Show this help message
#
# Environment Variables:
#   API_BASE_URL      API base URL (default: http://localhost:3000/api)
#   FRONTEND_URL      Frontend URL (default: http://localhost:3000)
#   DB_HOST           Database host (default: localhost)
#   DB_PORT           Database port (default: 5432)
#   DB_NAME           Database name (default: buildstock)
#   DB_USER           Database user (default: postgres)
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-buildstock}"
DB_USER="${DB_USER:-postgres}"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Options
VERBOSE=false
QUIET=false
FAIL_FAST=false

################################################################################
# Helper Functions
################################################################################

usage() {
    grep '^#' "$0" | grep -v '#!/bin/bash' | sed 's/^# //' | sed 's/^#//'
    exit 0
}

log_info() {
    if [ "$QUIET" = false ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_success() {
    if [ "$QUIET" = false ]; then
        echo -e "${GREEN}[PASS]${NC} $1"
    fi
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1" >&2
}

log_warning() {
    if [ "$QUIET" = false ]; then
        echo -e "${YELLOW}[WARN]${NC} $1"
    fi
}

log_test_start() {
    TESTS_RUN=$((TESTS_RUN + 1))
    if [ "$QUIET" = false ]; then
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}Test $TESTS_RUN:${NC} $1"
        echo -e "${BLUE}========================================${NC}"
    fi
}

log_test_pass() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    log_success "$1"
}

log_test_fail() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    log_error "$1"
    if [ "$FAIL_FAST" = true ]; then
        log_error "Fail-fast enabled. Stopping tests."
        print_summary
        exit 1
    fi
}

log_test_skip() {
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    log_warning "$1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found. Please install it first."
        return 1
    fi
    return 0
}

################################################################################
# Prerequisites Check
################################################################################

check_prerequisites() {
    log_test_start "Checking Prerequisites"

    local missing_tools=()

    # Check required tools
    for tool in curl jq psql node npm; do
        if ! check_command "$tool"; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_test_fail "Missing required tools: ${missing_tools[*]}"
        log_error "Please install missing tools before running tests"
        return 1
    fi

    log_test_pass "All required tools are installed"
    return 0
}

################################################################################
# Database Connectivity Tests
################################################################################

test_database_connection() {
    log_test_start "Database Connectivity"

    # Test PostgreSQL connection
    if PGPASSWORD=password psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        log_test_pass "Database connection successful"
    else
        log_test_fail "Cannot connect to database at $DB_HOST:$DB_PORT"
        return 1
    fi

    # Test if database tables exist
    local tables=$(
        PGPASSWORD=password psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' '
    )

    if [ "$tables" -gt 0 ]; then
        log_test_pass "Database contains $tables tables"
    else
        log_test_fail "Database does not contain any tables"
        return 1
    fi

    # Test core tables exist
    local core_tables=("users" "products" "merchants" "alerts")
    for table in "${core_tables[@]}"; do
        if PGPASSWORD=password psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "SELECT 1 FROM $table LIMIT 1;" &> /dev/null; then
            log_test_pass "Core table '$table' exists and is accessible"
        else
            log_test_fail "Core table '$table' not found or not accessible"
            return 1
        fi
    done

    return 0
}

################################################################################
# API Health Check Tests
################################################################################

test_api_health() {
    log_test_start "API Health Check"

    local health_url="$API_BASE_URL/health"

    log_info "Testing endpoint: $health_url"

    local response=$(curl -s -w "\n%{http_code}" "$health_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Health check returned 200 OK"

        if [ "$VERBOSE" = true ]; then
            log_info "Response body: $body"
        fi

        # Check if response contains expected fields
        if echo "$body" | jq -e '.status' &> /dev/null; then
            local status=$(echo "$body" | jq -r '.status')
            if [ "$status" = "ok" ] || [ "$status" = "healthy" ]; then
                log_test_pass "Health status is '$status'"
            else
                log_test_fail "Unexpected health status: $status"
                return 1
            fi
        fi
    else
        log_test_fail "Health check failed with HTTP code: $http_code"
        return 1
    fi

    return 0
}

################################################################################
# API Endpoint Tests
################################################################################

test_api_search() {
    log_test_start "API - Search Endpoint"

    local search_url="$API_BASE_URL/search?q=cement&limit=10"

    log_info "Testing endpoint: $search_url"

    local response=$(curl -s -w "\n%{http_code}" "$search_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Search endpoint returned 200 OK"

        # Validate response structure
        if echo "$body" | jq -e '.products' &> /dev/null; then
            local product_count=$(echo "$body" | jq '.products | length')
            log_test_pass "Found $product_count products for 'cement'"

            if [ "$product_count" -gt 0 ]; then
                # Check first product structure
                local first_product=$(echo "$body" | jq '.products[0]')
                local required_fields=("name" "price" "merchant" "stock_level")
                for field in "${required_fields[@]}"; do
                    if echo "$first_product" | jq -e ".$field" &> /dev/null; then
                        log_test_pass "Product contains field: $field"
                    else
                        log_test_fail "Product missing required field: $field"
                        return 1
                    fi
                done
            fi
        else
            log_test_fail "Invalid response structure - missing 'products' field"
            return 1
        fi
    else
        log_test_fail "Search endpoint failed with HTTP code: $http_code"
        return 1
    fi

    return 0
}

test_api_product_detail() {
    log_test_start "API - Product Detail Endpoint"

    # First, get a product ID from search
    local search_response=$(curl -s "$API_BASE_URL/search?q=cement&limit=1" 2>/dev/null)
    local product_id=$(echo "$search_response" | jq -r '.products[0].id' 2>/dev/null)

    if [ -z "$product_id" ] || [ "$product_id" = "null" ]; then
        log_test_skip "No product found to test detail endpoint"
        return 0
    fi

    local detail_url="$API_BASE_URL/products/$product_id"

    log_info "Testing endpoint: $detail_url"

    local response=$(curl -s -w "\n%{http_code}" "$detail_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Product detail endpoint returned 200 OK"

        # Validate response structure
        local required_fields=("id" "name" "description" "price" "merchant_prices")
        for field in "${required_fields[@]}"; do
            if echo "$body" | jq -e ".$field" &> /dev/null; then
                log_test_pass "Product contains field: $field"
            else
                log_test_fail "Product missing required field: $field"
                return 1
            fi
        done

        # Check merchant prices array
        local merchant_count=$(echo "$body" | jq '.merchant_prices | length')
        if [ "$merchant_count" -gt 0 ]; then
            log_test_pass "Product available from $merchant_count merchants"
        else
            log_test_fail "No merchant prices found"
            return 1
        fi
    else
        log_test_fail "Product detail endpoint failed with HTTP code: $http_code"
        return 1
    fi

    return 0
}

test_api_merchants() {
    log_test_start "API - Merchants Endpoint"

    local merchants_url="$API_BASE_URL/merchants"

    log_info "Testing endpoint: $merchants_url"

    local response=$(curl -s -w "\n%{http_code}" "$merchants_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Merchants endpoint returned 200 OK"

        if echo "$body" | jq -e '.[0]' &> /dev/null; then
            local merchant_count=$(echo "$body" | jq '. | length')
            log_test_pass "Found $merchant_count merchants"

            # Expected merchants
            local expected_merchants=("Travis Perkins" "Screwfix" "Jewson" "Wickes" "Huws Gray" "Selco")
            for merchant in "${expected_merchants[@]}"; do
                if echo "$body" | jq -e ".[] | select(.name == \"$merchant\")" &> /dev/null; then
                    log_test_pass "Expected merchant found: $merchant"
                else
                    log_test_fail "Expected merchant not found: $merchant"
                    return 1
                fi
            done
        else
            log_test_fail "Invalid response structure"
            return 1
        fi
    else
        log_test_fail "Merchants endpoint failed with HTTP code: $http_code"
        return 1
    fi

    return 0
}

test_api_categories() {
    log_test_start "API - Categories Endpoint"

    local categories_url="$API_BASE_URL/categories"

    log_info "Testing endpoint: $categories_url"

    local response=$(curl -s -w "\n%{http_code}" "$categories_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Categories endpoint returned 200 OK"

        local category_count=$(echo "$body" | jq '. | length')
        if [ "$category_count" -gt 0 ]; then
            log_test_pass "Found $category_count categories"
        else
            log_test_fail "No categories found"
            return 1
        fi
    else
        log_test_fail "Categories endpoint failed with HTTP code: $http_code"
        return 1
    fi

    return 0
}

test_api_alerts() {
    log_test_start "API - Alerts Endpoints"

    # Test price alerts endpoint (may require auth, so we expect 401 or 200)
    local alerts_url="$API_BASE_URL/alerts"

    log_info "Testing endpoint: $alerts_url"

    local response=$(curl -s -w "\n%{http_code}" "$alerts_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
        log_test_pass "Alerts endpoint accessible (HTTP $http_code)"
    else
        log_test_fail "Alerts endpoint returned unexpected HTTP code: $http_code"
        return 1
    fi

    return 0
}

################################################################################
# Frontend-Backend Communication Tests
################################################################################

test_frontend_accessibility() {
    log_test_start "Frontend Accessibility"

    log_info "Testing frontend URL: $FRONTEND_URL"

    local response=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test_pass "Frontend is accessible (HTTP 200)"

        # Check for key HTML elements
        if echo "$body" | grep -q "<html"; then
            log_test_pass "Frontend returns valid HTML"
        else
            log_test_fail "Frontend does not return valid HTML"
            return 1
        fi

        # Check for key frontend resources
        if echo "$body" | grep -q "script\|link.*stylesheet"; then
            log_test_pass "Frontend includes scripts/stylesheets"
        else
            log_test_fail "Frontend missing scripts or stylesheets"
            return 1
        fi
    else
        log_test_fail "Frontend not accessible (HTTP $http_code)"
        return 1
    fi

    return 0
}

test_frontend_api_communication() {
    log_test_start "Frontend-Backend API Communication"

    # Test if frontend can fetch data from API
    log_info "Testing if frontend can communicate with API"

    # Check API is accessible from frontend perspective
    local api_check_url="$FRONTEND_URL/api/health"

    local response=$(curl -s -w "\n%{http_code}" "$api_check_url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test_pass "Frontend can access API via relative path"
    else
        log_test_fail "Frontend cannot access API (HTTP $http_code)"
        return 1
    fi

    return 0
}

################################################################################
# Performance Tests
################################################################################

test_api_response_time() {
    log_test_start "API Response Time Performance"

    local endpoints=(
        "$API_BASE_URL/health"
        "$API_BASE_URL/search?q=test&limit=10"
        "$API_BASE_URL/merchants"
    )

    local max_acceptable_time=2000 # 2 seconds in milliseconds

    for endpoint in "${endpoints[@]}"; do
        log_info "Testing response time for: $endpoint"

        local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$endpoint" 2>/dev/null)
        local response_time_ms=$(echo "$response_time * 1000" | bc)

        local response_time_int=${response_time_ms%.*}

        if [ "$response_time_int" -lt "$max_acceptable_time" ]; then
            log_test_pass "Response time: ${response_time_ms}s (acceptable)"
        else
            log_test_fail "Response time: ${response_time_ms}s (exceeds ${max_acceptable_time}ms)"
            return 1
        fi
    done

    return 0
}

test_database_query_performance() {
    log_test_start "Database Query Performance"

    log_info "Testing database query performance"

    local start_time=$(date +%s%3N)
    PGPASSWORD=password psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT COUNT(*) FROM products;" &> /dev/null
    local end_time=$(date +%s%3N)

    local query_time=$((end_time - start_time))

    if [ "$query_time" -lt 1000 ]; then
        log_test_pass "Database query completed in ${query_time}ms (acceptable)"
    else
        log_test_fail "Database query took ${query_time}ms (exceeds 1000ms)"
        return 1
    fi

    return 0
}

################################################################################
# Smoke Tests
################################################################################

test_smoke_search_flow() {
    log_test_start "Smoke Test: Search Flow"

    # Simulate a user searching for a product
    log_info "Simulating user search for 'cement'"

    # Step 1: Search
    local search_response=$(curl -s "$API_BASE_URL/search?q=cement&limit=5" 2>/dev/null)

    if echo "$search_response" | jq -e '.products' &> /dev/null; then
        local product_count=$(echo "$search_response" | jq '.products | length')
        if [ "$product_count" -gt 0 ]; then
            log_test_pass "Search found $product_count products"
        else
            log_test_fail "Search returned no products"
            return 1
        fi
    else
        log_test_fail "Search returned invalid response"
        return 1
    fi

    # Step 2: Get first product details
    local product_id=$(echo "$search_response" | jq -r '.products[0].id')
    local detail_response=$(curl -s "$API_BASE_URL/products/$product_id" 2>/dev/null)

    if echo "$detail_response" | jq -e '.id' &> /dev/null; then
        log_test_pass "Product details retrieved successfully"
    else
        log_test_fail "Failed to retrieve product details"
        return 1
    fi

    # Step 3: Check merchant prices
    local merchant_count=$(echo "$detail_response" | jq '.merchant_prices | length')
    if [ "$merchant_count" -gt 0 ]; then
        log_test_pass "Product available from $merchant_count merchants"
    else
        log_test_fail "No merchants found for product"
        return 1
    fi

    return 0
}

test_smoke_merchant_data() {
    log_test_start "Smoke Test: Merchant Data Integrity"

    local merchants_response=$(curl -s "$API_BASE_URL/merchants" 2>/dev/null)

    # Check each merchant has required fields
    local merchant_count=$(echo "$merchants_response" | jq '. | length')

    for ((i=0; i<merchant_count; i++)); do
        local merchant=$(echo "$merchants_response" | jq ".[$i]")
        local merchant_name=$(echo "$merchant" | jq -r '.name')

        # Required fields
        local required_fields=("name" "base_url" "logo_url")
        for field in "${required_fields[@]}"; do
            if echo "$merchant" | jq -e ".$field" &> /dev/null; then
                : # Field exists
            else
                log_test_fail "Merchant '$merchant_name' missing field: $field"
                return 1
            fi
        done

        # Check base_url is valid
        local base_url=$(echo "$merchant" | jq -r '.base_url')
        if [[ $base_url =~ ^https?:// ]]; then
            : # Valid URL
        else
            log_test_fail "Merchant '$merchant_name' has invalid base_url: $base_url"
            return 1
        fi
    done

    log_test_pass "All $merchant_count merchants have valid data"
    return 0
}

################################################################################
# Test Runner
################################################################################

print_summary() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "Total Tests Run: ${BLUE}$TESTS_RUN${NC}"
    echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
    echo -e "${RED}Failed:${NC} $TESTS_FAILED"
    echo -e "${YELLOW}Skipped:${NC} $TESTS_SKIPPED"
    echo -e "${BLUE}========================================${NC}"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        return 1
    fi
}

run_all_tests() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}BuildStock Pro - Beta Test Suite${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "API Base URL: $API_BASE_URL"
    echo -e "Frontend URL: $FRONTEND_URL"
    echo -e "Database: $DB_HOST:$DB_PORT/$DB_NAME"
    echo -e "${BLUE}========================================${NC}"

    # Prerequisites
    check_prerequisites || true

    # Database Tests
    test_database_connection || true

    # API Health Tests
    test_api_health || true

    # API Endpoint Tests
    test_api_search || true
    test_api_product_detail || true
    test_api_merchants || true
    test_api_categories || true
    test_api_alerts || true

    # Frontend Tests
    test_frontend_accessibility || true
    test_frontend_api_communication || true

    # Performance Tests
    test_api_response_time || true
    test_database_query_performance || true

    # Smoke Tests
    test_smoke_search_flow || true
    test_smoke_merchant_data || true

    # Print summary
    print_summary
}

################################################################################
# Main
################################################################################

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -f|--fail-fast)
            FAIL_FAST=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Run all tests
run_all_tests

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
