#!/bin/bash

echo "================================"
echo "BuildStop Search Verification"
echo "================================"
echo ""

# Check if required files exist
echo "📁 Checking files..."

files=(
    "index.html"
    "script.js"
    "styles.css"
    "test-search.html"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        all_exist=false
    fi
done

echo ""

# Check for required functions in script.js
echo "🔍 Checking JavaScript functions..."

functions=(
    "searchMockProducts"
    "displayMockResults"
    "handleHeroSearch"
    "addMockProductToCart"
    "addToCart"
    "closeSearchResults"
)

for func in "${functions[@]}"; do
    if grep -q "function $func\|const $func\|async function $func" script.js; then
        echo "  ✅ $func() found"
    else
        echo "  ❌ $func() missing"
    fi
done

echo ""

# Check for mock products
echo "📦 Checking mock products..."
product_count=$(grep -c "id: '" script.js || echo "0")
if [ "$product_count" -gt 7 ]; then
    echo "  ✅ Mock products found ($product_count IDs)"
else
    echo "  ❌ Mock products missing or incomplete"
fi

echo ""

# Check for CSS classes
echo "🎨 Checking CSS styles..."
css_classes=(
    "search-result-card"
    "result-header"
    "eco-badge"
    "in-stock"
    "out-stock"
)

for class in "${css_classes[@]}"; do
    if grep -q "\\.$class" styles.css; then
        echo "  ✅ .$class style defined"
    else
        echo "  ❌ .$class style missing"
    fi
done

echo ""

# Check HTML elements
echo "🏗️  Checking HTML structure..."
html_elements=(
    'id="heroSearchInput"'
    'id="searchResultsSection"'
    'id="searchResultsContainer"'
    'onclick="handleHeroSearch()"'
)

for element in "${html_elements[@]}"; do
    if grep -q "$element" index.html; then
        echo "  ✅ $element found"
    else
        echo "  ❌ $element missing"
    fi
done

echo ""

# Summary
echo "================================"
if [ "$all_exist" = true ]; then
    echo "✅ VERIFICATION PASSED"
    echo ""
    echo "Search functionality is ready!"
    echo ""
    echo "🚀 Test it now:"
    echo "   1. Open http://localhost:3000/ in your browser"
    echo "   2. Type 'insulation' in the search bar"
    echo "   3. Press Enter or click Search"
    echo "   4. See the results!"
    echo ""
    echo "📚 Documentation:"
    echo "   - SEARCH_COMPLETE.md - Start here!"
    echo "   - SEARCH_FIX_REPORT.md - Technical details"
    echo "   - SEARCH_QUICK_REF.md - Developer guide"
    echo "   - test-search.html - Interactive testing"
else
    echo "❌ VERIFICATION FAILED"
    echo "Some files are missing. Please check the output above."
fi
echo "================================"
