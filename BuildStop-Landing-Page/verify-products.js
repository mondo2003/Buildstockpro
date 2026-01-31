/**
 * Quick verification script to check if product grid is set up correctly
 * Run this in browser console after loading the page
 */

function verifyProductGrid() {
    console.log('=== BuildStop Pro Product Grid Verification ===\n');

    // Check 1: Mock data loaded
    const mockDataCheck = typeof window.mockProducts !== 'undefined' && window.mockProducts.length > 0;
    console.log(`${mockDataCheck ? '✅' : '❌'} Mock data loaded: ${mockDataCheck ? window.mockProducts.length + ' products' : 'FAILED'}`);

    // Check 2: Helper functions
    const helpersCheck = typeof window.getProductsByCategory === 'function' &&
                        typeof window.getCategories === 'function' &&
                        typeof window.searchProducts === 'function';
    console.log(`${helpersCheck ? '✅' : '❌'} Helper functions: ${helpersCheck ? 'OK' : 'FAILED'}`);

    // Check 3: Products container exists
    const container = document.getElementById('products-grid');
    const containerCheck = container !== null;
    console.log(`${containerCheck ? '✅' : '❌'} Products container: ${containerCheck ? 'EXISTS' : 'NOT FOUND'}`);

    // Check 4: Products rendered
    const renderedCheck = container && container.children.length > 0;
    console.log(`${renderedCheck ? '✅' : '❌'} Products rendered: ${renderedCheck ? container.children.length + ' cards' : 'NONE'}`);

    // Check 5: Category filters exist
    const filters = document.querySelectorAll('.category-btn');
    const filtersCheck = filters.length > 0;
    console.log(`${filtersCheck ? '✅' : '❌'} Category filters: ${filtersCheck ? filters.length + ' buttons' : 'NONE'}`);

    // Check 6: Cart functions
    const cartCheck = typeof window.addToCart === 'function' &&
                     typeof window.openCartModal === 'function' &&
                     typeof window.renderCartItems === 'function';
    console.log(`${cartCheck ? '✅' : '❌'} Cart functions: ${cartCheck ? 'OK' : 'FAILED'}`);

    // Check 7: Products sorted by price
    const sortedCheck = mockDataCheck &&
                       window.mockProducts.every((product, i) => {
                           if (i === 0) return true;
                           return window.mockProducts[i - 1].price <= product.price;
                       });
    console.log(`${sortedCheck ? '✅' : '❌'} Products sorted by price: ${sortedCheck ? 'YES' : 'NO'}`);

    // Check 8: Responsive grid
    const gridStyles = window.getComputedStyle(container);
    const responsiveCheck = gridStyles.display === 'grid';
    console.log(`${responsiveCheck ? '✅' : '❌'} Responsive grid: ${responsiveCheck ? 'OK' : 'FAILED'}`);

    // Summary
    console.log('\n=== Summary ===');
    const allChecks = [mockDataCheck, helpersCheck, containerCheck, renderedCheck, filtersCheck, cartCheck, sortedCheck, responsiveCheck];
    const passed = allChecks.filter(c => c).length;
    console.log(`Passed: ${passed}/${allChecks.length} checks`);

    if (passed === allChecks.length) {
        console.log('✅ Product grid is fully functional!');
    } else {
        console.log('❌ Some checks failed. See details above.');
    }

    // Display products by category
    console.log('\n=== Products by Category ===');
    const categories = window.getCategories();
    categories.forEach(cat => {
        const products = window.getProductsByCategory(cat);
        console.log(`${cat}: ${products.length} products`);
    });

    return passed === allChecks.length;
}

// Auto-run on load
if (document.readyState === 'complete') {
    verifyProductGrid();
} else {
    window.addEventListener('load', verifyProductGrid);
}

// Make available globally for manual testing
window.verifyProductGrid = verifyProductGrid;
