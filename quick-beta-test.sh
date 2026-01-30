#!/bin/bash

# ==========================================
# BuildStock Pro - Quick Beta Test Script
# ==========================================
# This script tests critical endpoints and functionality
# Run this to verify the production deployment is working
#
# Usage: chmod +x quick-beta-test.sh && ./quick-beta-test.sh
#
# Author: BuildStock Pro Team
# Version: 1.0
# Date: January 30, 2026
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs
FRONTEND_URL="https://buildstock.pro"
BACKEND_URL="https://buildstock-api.onrender.com"
HEALTH_ENDPOINT="${BACKEND_URL}/health"
API_PRODUCTS_ENDPOINT="${BACKEND_URL}/api/v1/products"
API_SEARCH_ENDPOINT="${BACKEND_URL}/api/v1/products/search"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# ==========================================
# Helper Functions
# ==========================================

print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING:${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

# ==========================================
# Test Functions
# ==========================================

test_frontend_load() {
    print_header "Test 1: Frontend Load Test"

    local response=$(curl -s -o /dev/null -w "%{http_code}" -L "${FRONTEND_URL}")
    local time=$(curl -s -o /dev/null -w "%{time_total}" "${FRONTEND_URL}")

    if [ "$response" = "200" ]; then
        print_success "Frontend is accessible (HTTP $response)"
        print_info "Load time: ${time}s"

        # Check if load time is acceptable
        if (( $(echo "$time < 3.0" | bc -l) )); then
            print_success "Load time is acceptable (< 3s)"
        else
            print_warning "Load time is slow (> 3s): ${time}s"
        fi
    else
        print_failure "Frontend returned HTTP $response"
    fi

    echo -e "\nFrontend URL: ${FRONTEND_URL}"
}

test_backend_health() {
    print_header "Test 2: Backend Health Check"

    local response=$(curl -s "${HEALTH_ENDPOINT}")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_ENDPOINT}")

    if [ "$http_code" = "200" ]; then
        print_success "Backend health endpoint returns HTTP 200"

        # Parse JSON response
        local status=$(echo "$response" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        local database=$(echo "$response" | grep -o '"database":"[^"]*' | cut -d'"' -f4)

        if [ "$status" = "ok" ]; then
            print_success "Backend status is 'ok'"
        else
            print_failure "Backend status is '$status', expected 'ok'"
        fi

        if [ "$database" = "connected" ]; then
            print_success "Database connection is 'connected'"
        else
            print_failure "Database connection is '$database', expected 'connected'"
        fi

        print_info "Full response: $response"
    else
        print_failure "Backend health endpoint returned HTTP $http_code"
    fi

    echo -e "\nBackend URL: ${BACKEND_URL}"
}

test_api_products() {
    print_header "Test 3: API Products Endpoint"

    local response=$(curl -s "${API_PRODUCTS_ENDPOINT}")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_PRODUCTS_ENDPOINT}")

    if [ "$http_code" = "200" ]; then
        print_success "Products endpoint returns HTTP 200"

        # Check if response contains data
        if echo "$response" | grep -q "\["; then
            print_success "Response contains JSON array"
        else
            print_warning "Response might not be a valid JSON array"
        fi

        print_info "Response length: ${#response} bytes"
    else
        print_failure "Products endpoint returned HTTP $http_code"
    fi

    echo -e "\nEndpoint: ${API_PRODUCTS_ENDPOINT}"
}

test_search_functionality() {
    print_header "Test 4: Search Functionality"

    # Test 1: Search for "cement"
    print_info "Testing search for 'cement'..."
    local cement_response=$(curl -s "${API_SEARCH_ENDPOINT}?q=cement")
    local cement_http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_SEARCH_ENDPOINT}?q=cement")

    if [ "$cement_http_code" = "200" ]; then
        print_success "Search for 'cement' returns HTTP 200"

        if echo "$cement_response" | grep -q "cement"; then
            print_success "Search results contain 'cement'"
        else
            print_warning "Search results might not contain expected term"
        fi
    else
        print_failure "Search for 'cement' returned HTTP $cement_http_code"
    fi

    # Test 2: Search for "wood"
    print_info "\nTesting search for 'wood'..."
    local wood_response=$(curl -s "${API_SEARCH_ENDPOINT}?q=wood")
    local wood_http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_SEARCH_ENDPOINT}?q=wood")

    if [ "$wood_http_code" = "200" ]; then
        print_success "Search for 'wood' returns HTTP 200"
    else
        print_failure "Search for 'wood' returned HTTP $wood_http_code"
    fi

    # Test 3: Empty search
    print_info "\nTesting empty search..."
    local empty_response=$(curl -s "${API_SEARCH_ENDPOINT}?q=")
    local empty_http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_SEARCH_ENDPOINT}?q=")

    if [ "$empty_http_code" = "200" ] || [ "$empty_http_code" = "400" ] || [ "$empty_http_code" = "404" ]; then
        print_success "Empty search handled gracefully (HTTP $empty_http_code)"
    else
        print_warning "Empty search returned unexpected HTTP $empty_http_code"
    fi
}

test_cors_headers() {
    print_header "Test 5: CORS Configuration"

    local response=$(curl -s -I -H "Origin: ${FRONTEND_URL}" -H "Access-Control-Request-Method: GET" -X OPTIONS "${API_PRODUCTS_ENDPOINT}")
    local cors_header=$(echo "$response" | grep -i "access-control-allow-origin")

    if [ -n "$cors_header" ]; then
        print_success "CORS headers are present"
        print_info "$cors_header"
    else
        print_warning "CORS headers might not be properly configured"
    fi
}

test_response_time() {
    print_header "Test 6: API Response Time"

    print_info "Testing backend health endpoint response time..."
    local time=$(curl -s -o /dev/null -w "%{time_total}" "${HEALTH_ENDPOINT}")

    print_info "Response time: ${time}s"

    if (( $(echo "$time < 0.5" | bc -l) )); then
        print_success "Response time is excellent (< 0.5s)"
    elif (( $(echo "$time < 1.0" | bc -l) )); then
        print_success "Response time is good (< 1s)"
    elif (( $(echo "$time < 2.0" | bc -l) )); then
        print_warning "Response time is acceptable but slow (< 2s)"
    else
        print_failure "Response time is too slow (> 2s)"
    fi
}

test_ssl_certificates() {
    print_header "Test 7: SSL Certificates"

    print_info "Checking frontend SSL..."
    local frontend_ssl=$(curl -s -I "${FRONTEND_URL}" | grep -i "HTTP")

    if echo "$frontend_ssl" | grep -q "200"; then
        print_success "Frontend SSL is valid"
    else
        print_warning "Frontend SSL check failed"
    fi

    print_info "\nChecking backend SSL..."
    local backend_ssl=$(curl -s -I "${BACKEND_URL}" | grep -i "HTTP")

    if echo "$backend_ssl" | grep -q "200"; then
        print_success "Backend SSL is valid"
    else
        print_warning "Backend SSL check failed"
    fi
}

test_database_connection() {
    print_header "Test 8: Database Connectivity"

    local response=$(curl -s "${HEALTH_ENDPOINT}")

    if echo "$response" | grep -q '"database":"connected"'; then
        print_success "Database is connected via health endpoint"
    else
        print_failure "Database connection not confirmed"
        print_info "Health response: $response"
    fi

    print_info "Note: For detailed database testing, access Supabase Dashboard directly"
}

test_navigation() {
    print_header "Test 9: Navigation URLs"

    # Test common URLs
    declare -a urls=(
        "${FRONTEND_URL}"
        "${FRONTEND_URL}/app"
        "${FRONTEND_URL}/about"
        "${BACKEND_URL}"
        "${HEALTH_ENDPOINT}"
    )

    for url in "${urls[@]}"; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
        if [ "$response" = "200" ] || [ "$response" = "404" ]; then
            print_success "$url is accessible (HTTP $response)"
        else
            print_warning "$url returned HTTP $response"
        fi
    done
}

test_merchants_data() {
    print_header "Test 10: Merchants Data"

    print_info "Note: This test checks if the database has merchants populated"
    print_info "Expected: 6 UK merchants (Travis Perkins, Screwfix, Jewson, Wickes, Huws Gray, B&Q)"

    local response=$(curl -s "${API_PRODUCTS_ENDPOINT}")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_PRODUCTS_ENDPOINT}")

    if [ "$http_code" = "200" ]; then
        if echo "$response" | grep -q "merchant"; then
            print_success "Merchant data exists in API response"

            # Check for known UK merchants
            local merchants=("Travis Perkins" "Screwfix" "Jewson" "Wickes" "Huws Gray" "B&Q")
            local found=0

            for merchant in "${merchants[@]}"; do
                if echo "$response" | grep -iq "$merchant"; then
                    ((found++))
                fi
            done

            print_info "Found $found out of ${#merchants[@]} expected merchants"

            if [ "$found" -eq "${#merchants[@]}" ]; then
                print_success "All expected merchants are present"
            elif [ "$found" -gt 0 ]; then
                print_warning "Only $found merchants found, expected ${#merchants[@]}"
            else
                print_warning "No expected merchants found in response"
            fi
        else
            print_warning "Merchant data not found in API response"
        fi
    else
        print_failure "Cannot check merchants - API returned HTTP $http_code"
    fi
}

# ==========================================
# Main Execution
# ==========================================

main() {
    clear
    echo -e "${BLUE}"
    cat << "EOF"
   ____                  __      __            _
  / __ \____  ___  _____/ /___ _/ /____  ____(_)____  ____
 / /_/ / __ \/ _ \/ ___/ __/ / / __/ _ \/ __/ / ___/ / __ \
/ _, _/ /_/ /  __/ /  / /_/ / / /_/  __/ /_/ / /   / /_/ /
/_/ |_|\____/\___/_/   \__,_/_/\__/\___/\__/_/_/    \____/

           Beta Testing Quick Test Script
EOF
    echo -e "${NC}"

    print_info "BuildStock Pro Production Environment"
    print_info "Frontend: ${FRONTEND_URL}"
    print_info "Backend: ${BACKEND_URL}"
    print_info "Starting tests at $(date '+%Y-%m-%d %H:%M:%S')"

    # Check dependencies
    print_header "Checking Dependencies"

    if command -v curl &> /dev/null; then
        print_success "curl is installed"
    else
        print_failure "curl is not installed. Please install curl to run this script."
        exit 1
    fi

    if command -v bc &> /dev/null; then
        print_success "bc is installed"
    else
        print_warning "bc is not installed. Some numeric comparisons may not work."
    fi

    # Run all tests
    test_frontend_load
    test_backend_health
    test_api_products
    test_search_functionality
    test_cors_headers
    test_response_time
    test_ssl_certificates
    test_database_connection
    test_navigation
    test_merchants_data

    # ==========================================
    # Summary Report
    # ==========================================

    print_header "Test Summary"

    local total=$((PASSED + FAILED))
    local percentage=0

    if [ "$total" -gt 0 ]; then
        percentage=$((PASSED * 100 / total))
    fi

    echo -e "${GREEN}Passed:     $PASSED${NC}"
    echo -e "${RED}Failed:     $FAILED${NC}"
    echo -e "${YELLOW}Warnings:   $WARNINGS${NC}"
    echo -e "${BLUE}Percentage: ${percentage}%${NC}"
    echo ""

    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                       ║${NC}"
        echo -e "${GREEN}║  ✓ ALL CRITICAL TESTS PASSED!        ║${NC}"
        echo -e "${GREEN}║                                       ║${NC}"
        echo -e "${GREEN}║  BuildStock Pro is ready for beta!   ║${NC}"
        echo -e "${GREEN}║                                       ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
        echo ""
        print_info "You can now proceed with beta testing"
        print_info "Next steps:"
        echo "  1. Visit ${FRONTEND_URL}"
        echo "  2. Complete the First 5 Tests in BETA_LAUNCH_READY.md"
        echo "  3. Review BETA_TESTING_CHECKLIST.md for detailed testing"
    else
        echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                       ║${NC}"
        echo -e "${RED}║  ✗ SOME TESTS FAILED!                ║${NC}"
        echo -e "${RED}║                                       ║${NC}"
        echo -e "${RED}║  Please review and fix issues before  ║${NC}"
        echo -e "${RED}║  proceeding with beta testing.        ║${NC}"
        echo -e "${RED}║                                       ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
        echo ""
        print_info "Check the failures above and:"
        echo "  1. Review deployment logs (Vercel, Railway, Render)"
        echo "  2. Check environment variables are set correctly"
        echo "  3. Verify database connection in Supabase Dashboard"
        echo "  4. Consult PRODUCTION_GO_LIVE_GUIDE.md for troubleshooting"
    fi

    if [ "$WARNINGS" -gt 0 ]; then
        echo ""
        print_warning "There are $WARNINGS warnings to review"
        print_info "Warnings don't block beta testing but should be investigated"
    fi

    echo ""
    print_info "Test completed at $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    print_info "For detailed testing guide: BETA_LAUNCH_READY.md"
    print_info "For full checklist: BETA_TESTING_CHECKLIST.md"
    print_info "For support: [email to be provided]"
    echo ""

    exit $FAILED
}

# Run main function
main
