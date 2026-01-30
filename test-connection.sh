#!/bin/bash

# ==========================================
# BuildStock Pro - Connection Test Script
# ==========================================
# This script tests the connection between frontend and backend
# Usage: ./test-connection.sh [backend_url]
#
# Example:
#   ./test-connection.sh
#   ./test-connection.sh https://buildstock-api.railway.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL (default or from argument)
BACKEND_URL="${1:-https://buildstock-api.railway.app}"
FRONTEND_URL="https://buildstock.pro"

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# ==========================================
# Helper Functions
# ==========================================

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

print_test() {
    echo -n "${BLUE}Testing:${NC} $1 ... "
}

print_success() {
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}✗ FAILED${NC}"
    echo -e "  ${RED}Error:${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo -e "  ${YELLOW}Warning:${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ==========================================
# Tests
# ==========================================

test_backend_health() {
    print_section "1. Backend Health Check"

    print_test "Backend accessibility"
    if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success
    else
        print_failure "Backend is not accessible at $BACKEND_URL"
        return 1
    fi

    print_test "Health endpoint response"
    response=$(curl -s "$BACKEND_URL/health" 2>&1)
    if echo "$response" | grep -q '"success":true'; then
        print_success
        print_info "Response: $response"
    else
        print_failure "Invalid health response"
        echo "  Response: $response"
    fi
}

test_api_info() {
    print_section "2. API Information"

    print_test "API info endpoint"
    response=$(curl -s "$BACKEND_URL/api/v1" 2>&1)
    if echo "$response" | grep -q '"success":true'; then
        print_success
        print_info "Available endpoints:"
        echo "$response" | grep -o '"/api/[^"]*"' | head -5 | sed 's/^/    - /'
    else
        print_failure "Could not fetch API info"
    fi
}

test_cors() {
    print_section "3. CORS Configuration"

    print_test "CORS preflight request"
    cors_response=$(curl -s -X OPTIONS "$BACKEND_URL/api/v1" \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        -D - 2>&1)

    if echo "$cors_response" | grep -iq "access-control-allow-origin:.*$FRONTEND_URL"; then
        print_success
        print_info "CORS allows origin: $FRONTEND_URL"
    else
        print_failure "CORS not properly configured for $FRONTEND_URL"
        echo "  Make sure CORS_ORIGIN=$FRONTEND_URL in Railway"
    fi

    print_test "CORS headers present"
    if echo "$cors_response" | grep -iq "access-control-allow-methods"; then
        print_success
        methods=$(echo "$cors_response" | grep -i "access-control-allow-methods" | cut -d: -f2 | tr -d '\r')
        print_info "Allowed methods: $methods"
    else
        print_warning "Access-Control-Allow-Methods header not found"
    fi

    print_test "Credentials header"
    if echo "$cors_response" | grep -iq "access-control-allow-credentials: true"; then
        print_success
    else
        print_warning "Credentials header not set (may be needed for cookies)"
    fi
}

test_search_endpoint() {
    print_section "4. Search Endpoint"

    print_test "Product search functionality"
    search_response=$(curl -s "$BACKEND_URL/api/v1/search?q=concrete&limit=5" 2>&1)

    if echo "$search_response" | grep -q '"success":true'; then
        print_success
        print_info "Search query executed successfully"
    else
        print_failure "Search endpoint returned error"
        echo "  Response: $search_response"
    fi

    print_test "Search response structure"
    if echo "$search_response" | grep -q '"data":\['; then
        print_success
        count=$(echo "$search_response" | grep -o '"count":[0-9]*' | cut -d: -f2)
        print_info "Results found: $count"
    else
        print_warning "Unexpected response structure"
    fi
}

test_merchants_endpoint() {
    print_section "5. Merchants Endpoint"

    print_test "Merchants list endpoint"
    merchants_response=$(curl -s "$BACKEND_URL/api/v1/merchants" 2>&1)

    if echo "$merchants_response" | grep -q '"success":true'; then
        print_success
        print_info "Merchants endpoint accessible"
    else
        print_warning "Merchants endpoint may not be available"
    fi
}

test_response_time() {
    print_section "6. Performance Tests"

    print_test "Backend response time"
    start_time=$(date +%s%3N)
    curl -s "$BACKEND_URL/health" > /dev/null 2>&1
    end_time=$(date +%s%3N)

    duration=$((end_time - start_time))

    if [ $duration -lt 1000 ]; then
        print_success
        print_info "Response time: ${duration}ms (excellent)"
    elif [ $duration -lt 3000 ]; then
        print_success
        print_info "Response time: ${duration}ms (acceptable)"
    else
        print_warning "Response time: ${duration}ms (slow)"
    fi
}

test_ssl() {
    print_section "7. SSL/HTTPS Check"

    print_test "SSL certificate validity"
    if curl -s -I "$BACKEND_URL/health" 2>&1 | grep -iq "HTTP/"; then
        print_success
        print_info "SSL certificate is valid"
    else
        print_failure "SSL certificate check failed"
    fi

    print_test "HTTPS enforcement"
    if [[ "$BACKEND_URL" == https://* ]]; then
        print_success
        print_info "Using HTTPS (secure)"
    else
        print_warning "Not using HTTPS - backend URL should start with https://"
    fi
}

test_dns() {
    print_section "8. DNS Resolution"

    print_test "Backend DNS resolution"
    host=$(echo "$BACKEND_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
    if nslookup "$host" > /dev/null 2>&1; then
        print_success
        ip=$(nslookup "$host" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        print_info "Resolved to: $ip"
    else
        print_failure "Could not resolve DNS for $host"
    fi
}

test_api_security() {
    print_section "9. Security Headers"

    print_test "Security headers check"
    headers=$(curl -s -I "$BACKEND_URL/health" 2>&1)

    # Check for common security headers
    security_score=0

    if echo "$headers" | grep -iq "x-content-type-options:"; then
        ((security_score++))
    fi

    if echo "$headers" | grep -iq "x-frame-options:"; then
        ((security_score++))
    fi

    if echo "$headers" | grep -iq "strict-transport-security:"; then
        ((security_score++))
    fi

    if [ $security_score -ge 2 ]; then
        print_success
        print_info "Security headers present: $security_score/3 recommended"
    else
        print_warning "Only $security_score/3 security headers present"
    fi
}

test_endpoint_variety() {
    print_section "10. Additional Endpoints"

    endpoints=(
        "/api/v1/search/suggestions?q=con"
        "/api/v1/search/popular"
        "/api/v1/merchants"
    )

    for endpoint in "${endpoints[@]}"; do
        print_test "Endpoint: $endpoint"
        response=$(curl -s "$BACKEND_URL$endpoint" 2>&1)

        if echo "$response" | grep -q '"success":true'; then
            print_success
        else
            print_warning "Endpoint may not be implemented"
        fi
    done
}

print_configuration() {
    print_section "Configuration Summary"

    echo -e "${BLUE}Backend URL:${NC} $BACKEND_URL"
    echo -e "${BLUE}Frontend URL:${NC} $FRONTEND_URL"
    echo ""
    echo -e "${BLUE}Required Environment Variables:${NC}"
    echo "  Railway (Backend):"
    echo "    - CORS_ORIGIN=$FRONTEND_URL"
    echo "    - SUPABASE_URL=your_supabase_url"
    echo "    - SUPABASE_SERVICE_ROLE_KEY=your_key"
    echo "    - DATABASE_URL=your_database_url"
    echo ""
    echo "  Vercel (Frontend):"
    echo "    - NEXT_PUBLIC_API_URL=$BACKEND_URL"
    echo "    - NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
    echo ""
}

print_troubleshooting() {
    print_section "Troubleshooting Tips"

    echo -e "${YELLOW}If CORS fails:${NC}"
    echo "  1. Check Railway variables: CORS_ORIGIN=$FRONTEND_URL"
    echo "  2. Redeploy backend after updating variables"
    echo "  3. Clear browser cache (Ctrl+Shift+R)"
    echo ""
    echo -e "${YELLOW}If backend is unreachable:${NC}"
    echo "  1. Check Railway deployment status"
    echo "  2. View Railway logs for errors"
    echo "  3. Verify service is not suspended"
    echo ""
    echo -e "${YELLOW}If environment variables don't load:${NC}"
    echo "  1. Vercel: Check variable names start with NEXT_PUBLIC_"
    echo "  2. Railway: Check variables are set for correct environment"
    echo "  3. Redeploy after adding/changing variables"
    echo ""
}

print_final_report() {
    print_section "Test Results Summary"

    TOTAL=$((PASSED + FAILED + WARNINGS))

    echo -e "${GREEN}Passed:${NC}  $PASSED"
    echo -e "${RED}Failed:${NC}  $FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""
    echo -e "Total tests run: $TOTAL"

    if [ $FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All critical tests passed!${NC}"
        echo -e "${GREEN}✓ Frontend-Backend connection is working${NC}"
        echo ""
        return 0
    else
        echo ""
        echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
        echo ""
        return 1
    fi
}

# ==========================================
# Main Execution
# ==========================================

main() {
    clear
    print_header "BuildStock Pro - Connection Test Suite"
    echo -e "${BLUE}Testing connection between:${NC}"
    echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
    echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
    echo ""

    # Run all tests
    test_backend_health
    test_api_info
    test_cors
    test_search_endpoint
    test_merchants_endpoint
    test_response_time
    test_ssl
    test_dns
    test_api_security
    test_endpoint_variety

    # Print configuration and summary
    print_configuration
    print_troubleshooting
    print_final_report

    # Exit with appropriate code
    if [ $FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main
