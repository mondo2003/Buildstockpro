/**
 * BuildStop Pro - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('.header');

    // Mobile Menu Toggle
    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navList.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navList.classList.remove('active');
            }
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Don't prevent default for empty anchors
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                if (mobileMenuBtn && navList) {
                    mobileMenuBtn.classList.remove('active');
                    navList.classList.remove('active');
                }

                // Account for fixed header height
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle dynamic app links - focus on search for search link
    document.querySelectorAll('a[data-app-link="search"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('heroSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // Handle other dynamic app links - scroll to contact section
    document.querySelectorAll('a[data-app-link]:not([data-app-link="search"])').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector('#contact');
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle root links - scroll to contact section
    document.querySelectorAll('a[href="/"]').forEach(link => {
        // Skip if it's a nav link or has data-app-link attribute
        if (!link.hasAttribute('data-app-link') && !link.closest('.nav')) {
            link.addEventListener('click', function(e) {
                // Check if this should scroll to contact
                const text = this.textContent.trim().toLowerCase();
                const shouldScrollToContact = text.includes('get started') ||
                                     text.includes('browse all') ||
                                     text.includes('started');

                if (shouldScrollToContact) {
                    e.preventDefault();
                    // Scroll to contact section
                    const targetElement = document.querySelector('#contact');
                    if (targetElement) {
                        const headerHeight = header ? header.offsetHeight : 0;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                // Logo clicks will naturally scroll to top (default behavior)
            });
        }
    });

    // Header Scroll Effect
    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class based on scroll position
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // Add reveal on scroll animation
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

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .product-card, .section-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Reserve button handler - now adds demo product to cart
function handleReserve() {
    addDemoProductToCart();
}

// Mock product data for fallback/demo
const mockProducts = [
  {
    id: '1',
    name: 'Recycled Insulation Roll',
    description: 'High-performance thermal insulation made from 80% recycled glass. Significantly reduces heat loss.',
    category: 'Insulation',
    price: 24.99,
    stock: 42,
    eco: 'A',
    merchant: 'BuildBase - Camden'
  },
  {
    id: '2',
    name: 'FSC-Certified Plywood Sheet',
    description: 'Structural grade plywood from responsibly managed forests. Perfect for roofing and flooring.',
    category: 'Timber',
    price: 45.00,
    stock: 28,
    eco: 'A',
    merchant: 'Travis Perkins - Kings Cross'
  },
  {
    id: '3',
    name: 'Low-VOC Interior Paint',
    description: 'Premium interior paint with minimal volatile organic compounds. Available in 50+ colors.',
    category: 'Paints',
    price: 32.50,
    stock: 5,
    eco: 'B',
    merchant: 'HomeBase - Holloway'
  },
  {
    id: '4',
    name: 'Solar Reflective Roof Tiles',
    description: 'Energy-efficient roof tiles that reflect sunlight and reduce cooling costs by up to 20%.',
    category: 'Roofing',
    price: 89.99,
    stock: 150,
    eco: 'A',
    merchant: 'BuildBase - Camden'
  },
  {
    id: '5',
    name: 'Bamboo Flooring Panels',
    description: 'Sustainable bamboo flooring with natural finish. Rapidly renewable material.',
    category: 'Flooring',
    price: 67.50,
    stock: 0,
    eco: 'A',
    merchant: 'Screwfix - Islington'
  },
  {
    id: '6',
    name: 'LED Downlight Fixtures',
    description: 'Energy-efficient LED downlights with 90% energy savings compared to incandescent bulbs.',
    category: 'Electrical',
    price: 18.50,
    stock: 75,
    eco: 'A',
    merchant: 'Screwfix - Islington'
  },
  {
    id: '7',
    name: 'Water-Based Exterior Wood Stain',
    description: 'Eco-friendly wood stain with UV protection. Low odor and easy cleanup with water.',
    category: 'Paints',
    price: 28.75,
    stock: 35,
    eco: 'B',
    merchant: 'HomeBase - Holloway'
  },
  {
    id: '8',
    name: 'Smart Thermostat',
    description: 'WiFi-enabled smart thermostat with learning algorithms. Reduces heating costs by up to 23%.',
    category: 'Electrical',
    price: 249.99,
    stock: 22,
    eco: 'A',
    merchant: 'Screwfix - Islington'
  },
  {
    id: '9',
    name: 'Low-Carbon Concrete Mix',
    description: 'Reduced carbon footprint concrete with 40% fewer emissions than standard mixes.',
    category: 'Concrete',
    price: 12.50,
    stock: 150,
    eco: 'A',
    merchant: 'Travis Perkins - Islington'
  },
  {
    id: '10',
    name: 'Natural Cork Flooring',
    description: 'Sustainable cork flooring harvested without harming trees. Warm, comfortable, and acoustic.',
    category: 'Flooring',
    price: 32.50,
    stock: 45,
    eco: 'A',
    merchant: 'Jewson - Kings Cross'
  },
  {
    id: '11',
    name: 'Sheep Wool Insulation',
    description: 'Natural sheep wool insulation batting. Breathable, renewable, and excellent thermal performance.',
    category: 'Insulation',
    price: 35.00,
    stock: 60,
    eco: 'A',
    merchant: 'Travis Perkins - Islington'
  },
  {
    id: '12',
    name: 'Clay Roof Tiles',
    description: 'Traditional clay tiles with modern eco-friendly manufacturing process.',
    category: 'Roofing',
    price: 2.50,
    stock: 500,
    eco: 'A',
    merchant: 'BuildBase - Camden'
  }
];

// Search through mock products and sort by price (cheapest first)
function searchMockProducts(query) {
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results = mockProducts.filter(product => {
        const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
    });
    // Sort by price (cheapest first)
    return results.sort((a, b) => a.price - b.price);
}

// Quick search from suggestion chips
function quickSearch(term) {
    const searchInput = document.getElementById('heroSearchInput');
    if (searchInput) {
        searchInput.value = term;
        handleHeroSearch();
    }
}

// Hero search handler - uses mock data sorted by price
function handleHeroSearch() {
    const searchInput = document.getElementById('heroSearchInput');
    const query = searchInput.value.trim();

    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    // Show search results section
    const searchResultsSection = document.getElementById('searchResultsSection');
    const searchLoading = document.getElementById('searchLoading');
    const searchErrorMessage = document.getElementById('searchErrorMessage');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsTitle = document.getElementById('searchResultsTitle');

    searchResultsSection.style.display = 'block';
    searchLoading.style.display = 'flex';
    searchErrorMessage.style.display = 'none';
    searchResultsContainer.innerHTML = '';
    searchResultsTitle.textContent = `Search Results for "${query}"`;

    // Simulate brief loading for better UX, then display results
    setTimeout(() => {
        displayMockResults(query);
    }, 300);
}

// Display mock product results
function displayMockResults(query) {
    const searchLoading = document.getElementById('searchLoading');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsTitle = document.getElementById('searchResultsTitle');

    searchLoading.style.display = 'none';

    const results = searchMockProducts(query);

    if (results.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="no-results">
                <p>No results found for "${query}"</p>
                <p>Try searching for: insulation, timber, paint, flooring, lighting, etc.</p>
            </div>
        `;
        return;
    }

    searchResultsTitle.textContent = `Search Results for "${query}" (${results.length} found, sorted by price)`;

    searchResultsContainer.innerHTML = results.map(product => {
        const ecoBadge = product.eco === 'A' ? '<span class="eco-badge">🌿 Eco-Friendly</span>' : '';
        return `
            <div class="search-result-card">
                <div class="result-header">
                    <h3>${escapeHtml(product.name)}</h3>
                    <span class="result-price">£${product.price.toFixed(2)}</span>
                </div>
                <p class="result-desc">${escapeHtml(product.description)}</p>
                <div class="result-meta">
                    <span class="result-merchant">📍 ${escapeHtml(product.merchant)}</span>
                    ${ecoBadge}
                </div>
                <div class="result-meta">
                    <span class="result-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}">
                        ${product.stock > 0 ? `● In Stock (${product.stock} units)` : '● Out of Stock'}
                    </span>
                    <span class="result-category">Category: ${escapeHtml(product.category)}</span>
                </div>
                <button
                    class="btn btn-sm btn-primary"
                    onclick="addMockProductToCart('${product.id}', '${escapeHtml(product.name).replace(/'/g, "\\'")}', ${product.price})"
                    ${product.stock <= 0 ? 'disabled' : ''}
                >
                    ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;
    }).join('');
}

// Add mock product to cart
function addMockProductToCart(id, name, price) {
    const cartProduct = {
        id: `mock-${id}`,
        name: name,
        variant: 'Standard',
        price: price,
        image: '📦'
    };

    addToCart(cartProduct);
}

// Add to cart from search results
function addToCartFromSearch(index, name, price) {
    if (!window.currentSearchResults || !window.currentSearchResults[index]) return;

    const cartProduct = {
        id: `search-${Date.now()}-${index}`,
        name: name,
        variant: 'Standard',
        price: price,
        image: '📦'
    };

    addToCart(cartProduct);
}

// Add to cart from search results (alias for consistency)
window.addToCartFromSearch = addToCartFromSearch;

// Close search results
function closeSearchResults() {
    const searchResultsSection = document.getElementById('searchResultsSection');
    if (searchResultsSection) {
        searchResultsSection.style.display = 'none';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('heroSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleHeroSearch();
            }
        });
    }
});

// ============================================
// CONTACT FORM & NEWSLETTER FUNCTIONALITY
// ============================================

// Contact form handler with validation and loading states
function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Get form values
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const subject = formData.get('subject');
    const message = formData.get('message')?.trim();

    // Clear previous errors
    clearFormErrors(form);

    // Validate inputs
    let hasErrors = false;

    if (!name || name.length < 2) {
        showFieldError(form, 'name', 'Please enter your name (at least 2 characters)');
        hasErrors = true;
    }

    if (!email || !isValidEmail(email)) {
        showFieldError(form, 'email', 'Please enter a valid email address');
        hasErrors = true;
    }

    if (!subject) {
        showFieldError(form, 'subject', 'Please select a subject');
        hasErrors = true;
    }

    if (!message || message.length < 10) {
        showFieldError(form, 'message', 'Please enter a message (at least 10 characters)');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-small"></span> Sending...';
    submitButton.classList.add('loading');

    // Simulate API call
    setTimeout(() => {
        // Show success message
        showFormSuccess(form, 'Thank you! We\'ll contact you soon.');

        // Reset form
        form.reset();

        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.classList.remove('loading');

        // Remove success message after 5 seconds
        setTimeout(() => {
            removeFormSuccess(form);
        }, 5000);
    }, 1000);
}

// Newsletter signup handler
function handleNewsletterSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    // Clear previous errors
    clearNewsletterErrors(form);

    // Validate email
    if (!email || !isValidEmail(email)) {
        showNewsletterError(form, 'Please enter a valid email address');
        return;
    }

    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Subscribing...';
    submitButton.classList.add('loading');

    // Simulate API call
    setTimeout(() => {
        // Show success message
        showNewsletterSuccess(form, 'Thanks for subscribing!');

        // Clear input
        emailInput.value = '';

        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.classList.remove('loading');

        // Remove success message after 5 seconds
        setTimeout(() => {
            removeNewsletterSuccess(form);
        }, 5000);
    }, 1000);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error in contact form
function showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    // Add error class to field
    field.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);

    // Shake animation
    field.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

// Clear all form errors
function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
    form.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

// Show success message in contact form
function showFormSuccess(form, message) {
    const container = form.parentElement;

    // Remove existing success message
    const existingSuccess = container.querySelector('.form-success-message');
    if (existingSuccess) existingSuccess.remove();

    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-message';
    successDiv.innerHTML = `
        <span class="success-icon">✓</span>
        <span>${message}</span>
    `;
    container.insertBefore(successDiv, form);

    // Add animation class
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 10);
}

// Remove success message from contact form
function removeFormSuccess(form) {
    const container = form.parentElement;
    const successMessage = container.querySelector('.form-success-message');
    if (successMessage) {
        successMessage.classList.remove('show');
        setTimeout(() => {
            successMessage.remove();
        }, 300);
    }
}

// Newsletter error handling
function showNewsletterError(form, message) {
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    // Remove existing error
    const existingError = form.parentElement.querySelector('.newsletter-error');
    if (existingError) existingError.remove();

    // Add error class
    emailInput.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'newsletter-error';
    errorDiv.textContent = message;
    form.parentElement.appendChild(errorDiv);

    // Shake animation
    emailInput.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        emailInput.style.animation = '';
    }, 500);
}

// Clear newsletter errors
function clearNewsletterErrors(form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.classList.remove('error');
    }
    form.parentElement.querySelectorAll('.newsletter-error').forEach(error => {
        error.remove();
    });
}

// Show newsletter success message
function showNewsletterSuccess(form, message) {
    const container = form.parentElement;

    // Remove existing success message
    const existingSuccess = container.querySelector('.newsletter-success');
    if (existingSuccess) existingSuccess.remove();

    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'newsletter-success';
    successDiv.innerHTML = `
        <span class="success-icon">✓</span>
        <span>${message}</span>
    `;
    container.appendChild(successDiv);

    // Add animation class
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 10);
}

// Remove newsletter success message
function removeNewsletterSuccess(form) {
    const container = form.parentElement;
    const successMessage = container.querySelector('.newsletter-success');
    if (successMessage) {
        successMessage.classList.remove('show');
        setTimeout(() => {
            successMessage.remove();
        }, 300);
    }
}

// ============================================
// SHOPPING CART FUNCTIONALITY
// ============================================

// Cart state
let cart = JSON.parse(localStorage.getItem('buildstopCart')) || [];

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initializeCartModal();
    initializeAddToCartButtons();
});

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('buildstopCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Animate badge
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
            cartCount.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                cartCount.style.animation = '';
            }, 500);
        } else {
            cartCount.style.display = 'none';
        }
    }
}

// Add item to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Add emoji/image if not provided
        const cartProduct = {
            ...product,
            quantity: 1,
            image: product.image || '📦'
        };
        cart.push(cartProduct);
    }

    saveCart();
    showAddToCartNotification(product.name);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCart();
    renderCartItems();
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => String(item.id) === String(productId));
    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartItems();
        }
    }
}

// Calculate cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Show "Added to Cart" toast notification
function showAddToCartNotification(productName) {
    // Remove existing notification if any
    const existingToast = document.querySelector('.cart-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">✓</span>
            <div class="toast-message">
                <strong>Added to Cart</strong>
                <p>${productName}</p>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize cart modal
function initializeCartModal() {
    // Create cart modal if it doesn't exist
    if (!document.getElementById('cartModal')) {
        const cartModalHTML = `
            <div id="cartModal" class="cart-modal">
                <div class="cart-modal-overlay" onclick="closeCartModal()"></div>
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <h2>Shopping Cart</h2>
                        <button class="cart-modal-close" onclick="closeCartModal()" aria-label="Close cart">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-modal-body">
                        <div id="cartItems" class="cart-items"></div>
                        <div id="emptyCartMessage" class="empty-cart-message" style="display: none;">
                            <span class="empty-cart-icon">🛒</span>
                            <p>Your cart is empty</p>
                            <button onclick="closeCartModal()" class="btn btn-primary">Continue Shopping</button>
                        </div>
                    </div>
                    <div class="cart-modal-footer">
                        <div class="cart-total">
                            <span>Total:</span>
                            <span id="cartTotalAmount" class="cart-total-amount">£0.00</span>
                        </div>
                        <button id="checkoutButton" onclick="handleCheckout()" class="btn btn-primary btn-large full-width" ${cart.length === 0 ? 'disabled' : ''}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartModalHTML);
    }
}

// Open cart modal
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderCartItems();
    }
}

// Close cart modal
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutButton = document.getElementById('checkoutButton');
    const cartTotalAmount = document.getElementById('cartTotalAmount');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        if (emptyCartMessage) emptyCartMessage.style.display = 'flex';
        if (checkoutButton) checkoutButton.disabled = true;
        if (cartTotalAmount) cartTotalAmount.textContent = '£0.00';
        return;
    }

    cartItemsContainer.style.display = 'block';
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (checkoutButton) checkoutButton.disabled = false;

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                <span class="cart-item-placeholder">${item.image || '📦'}</span>
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-variant">${item.variant || 'Standard'}</p>
                <p class="cart-item-price">£${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Update total
    if (cartTotalAmount) {
        cartTotalAmount.textContent = `£${getCartTotal().toFixed(2)}`;
    }
}

// Initialize "Add to Cart" buttons
function initializeAddToCartButtons() {
    // For the demo product card, replace the Reserve button with Add to Cart
    const reserveButton = document.querySelector('.product-demo .product-card button[onclick="handleReserve()"]');
    if (reserveButton) {
        reserveButton.setAttribute('onclick', 'addDemoProductToCart()');
        reserveButton.textContent = 'Add to Cart';
        reserveButton.classList.remove('btn-secondary');
        reserveButton.classList.add('btn-primary');
    }
}

// Add demo product to cart
function addDemoProductToCart() {
    const demoProduct = {
        id: 1,
        name: 'Recycled Insulation Roll',
        variant: '80% Recycled Glass',
        price: 24.99,
        image: '📦'
    };
    addToCart(demoProduct);
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const total = getCartTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Build order summary
    const orderSummary = cart.map(item =>
        `• ${item.name} (${item.quantity}x) - £${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const checkoutMessage = `
ORDER SUMMARY
=============
Total Items: ${itemCount}
Total Amount: £${total.toFixed(2)}

${orderSummary}

Please complete the form below to finalize your order.
    `;

    alert(checkoutMessage);

    // Close cart and scroll to contact section
    closeCartModal();

    // Scroll to contact section
    setTimeout(() => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
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

// Close modal on Escape or X key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
        // Only close if not typing in an input field
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            closeCartModal();
            closeBetaModal();
        }
    }
});

// ============================================
// EXPOSE CART FUNCTIONS TO WINDOW
// ============================================
// Must be at the END after all functions are defined
// This makes them available to other scripts (products.js)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.getCartTotal = getCartTotal;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.renderCartItems = renderCartItems;
window.addDemoProductToCart = addDemoProductToCart;
window.handleCheckout = handleCheckout;
