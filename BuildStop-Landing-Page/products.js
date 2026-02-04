/**
 * BuildStop Pro - Product Grid Functionality
 */

// Render product card HTML
function renderProductCard(product) {
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    const carbonClass = product.carbonFootprint < 10 ? 'low' : product.carbonFootprint < 30 ? 'medium' : 'high';

    return `
        <div class="product-card-grid" data-category="${product.category}">
            <div class="product-image-grid">
                <span class="product-emoji">${product.image}</span>
                ${product.ecoFriendly ? '<div class="badge-eco">🌿 Eco-Friendly</div>' : ''}
                <div class="badge-category">${product.category}</div>
            </div>
            <div class="product-details-grid">
                <h3>${product.name}</h3>
                <p class="product-desc-grid">${product.description}</p>

                <div class="product-meta-grid">
                    <div class="rating-grid">
                        <span class="stars">${stars}</span>
                        <span class="count">(${product.reviewCount})</span>
                    </div>
                    <div class="carbon-stat">
                        <span class="label">Carbon:</span>
                        <span class="value ${carbonClass}">${product.carbonFootprint}kg</span>
                    </div>
                </div>

                <div class="availability-grid">
                    <div class="store-info-grid">
                        <span class="icon">📍</span>
                        <div>
                            <strong>${product.store}</strong>
                            <span class="distance">${product.distance} miles away</span>
                        </div>
                    </div>
                    <div class="status ${product.inStock ? 'in-stock' : 'out-stock'}">
                        ● ${product.inStock ? `In Stock (${product.stockCount})` : 'Out of Stock'}
                    </div>
                </div>

                <div class="product-footer-grid">
                    <div class="price">£${product.price.toFixed(2)}</div>
                    <button class="btn btn-sm btn-primary" onclick="addProductToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render products grid
function renderProducts(products, containerId = 'products-grid') {
    console.log('renderProducts called with', products.length, 'products for container', containerId);
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    console.log('Container found, rendering products...');

    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No products found</p>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    const productHTML = products.map(renderProductCard).join('');
    console.log('Generated HTML for', products.length, 'products');
    container.innerHTML = productHTML;
    console.log('Products inserted into DOM');

    // Re-observe new product cards for animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    container.querySelectorAll('.product-card-grid').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    console.log('Product cards observed for animation');
}

// Add product to cart from grid
function addProductToCart(productId) {
    console.log('addProductToCart called with productId:', productId);
    console.log('window.mockProducts available:', typeof window.mockProducts !== 'undefined');
    console.log('window.addToCart available:', typeof window.addToCart !== 'undefined');

    if (typeof window.mockProducts === 'undefined') {
        console.error('window.mockProducts is not defined!');
        alert('Error: Products not loaded. Please refresh the page.');
        return;
    }

    if (typeof window.addToCart === 'undefined') {
        console.error('window.addToCart is not defined!');
        alert('Error: Cart not initialized. Please refresh the page.');
        return;
    }

    const product = window.mockProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found with ID:', productId);
        return;
    }

    console.log('Found product:', product.name);

    const cartProduct = {
        id: product.id,
        name: product.name,
        variant: product.category,
        price: product.price,
        image: product.image
    };

    console.log('Calling window.addToCart with:', cartProduct);
    window.addToCart(cartProduct);
}

// Initialize products on page load
function initializeProducts() {
    console.log('initializeProducts called');
    console.log('window.mockProducts:', window.mockProducts);

    if (typeof window.mockProducts !== 'undefined' && window.mockProducts.length > 0) {
        console.log('Rendering', window.mockProducts.length, 'products');
        renderProducts(window.mockProducts);
        setupCategoryFilters();
    } else {
        console.error('Mock products not available or empty!');
        // Try again after a short delay
        setTimeout(() => {
            if (typeof window.mockProducts !== 'undefined' && window.mockProducts.length > 0) {
                console.log('Retry successful: Rendering', window.mockProducts.length, 'products');
                renderProducts(window.mockProducts);
                setupCategoryFilters();
            } else {
                console.error('Still no products available after retry');
            }
        }, 500);
    }
}

// Setup category filter buttons
function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const container = document.getElementById('products-grid');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get category and filter products
            const category = this.getAttribute('data-category');

            // Smooth fade out animation
            if (container) {
                container.style.opacity = '0';
                container.style.transform = 'translateY(10px)';
                container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                setTimeout(() => {
                    const filteredProducts = window.getProductsByCategory(category);
                    renderProducts(filteredProducts);

                    // Fade in animation
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 300);
            }
        });
    });
}

// Beta modal functions
function showBetaModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('betaModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeBetaModal() {
    const modal = document.getElementById('betaModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Initialize products when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts and data are loaded
    setTimeout(() => {
        console.log('Initializing product grid...');
        console.log('Mock products available:', typeof window.mockProducts !== 'undefined');
        if (typeof window.mockProducts !== 'undefined') {
            console.log('Number of products:', window.mockProducts.length);
        }
        initializeProducts();
    }, 100);
});

// Also initialize when window loads (fallback)
window.addEventListener('load', () => {
    const container = document.getElementById('products-grid');
    if (container && container.children.length === 0) {
        console.log('Fallback: Loading products on window load');
        console.log('Mock products available:', typeof window.mockProducts !== 'undefined');
        if (typeof window.mockProducts !== 'undefined') {
            console.log('Number of products:', window.mockProducts.length);
        }
        initializeProducts();
    }
});

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================

// Make functions available globally for HTML onclick handlers
window.addProductToCart = addProductToCart;
window.renderProducts = renderProducts;
window.initializeProducts = initializeProducts;
window.setupCategoryFilters = setupCategoryFilters;
