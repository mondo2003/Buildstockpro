# Search Code Quick Reference

## Main Search Function

```javascript
async function handleHeroSearch() {
    const searchInput = document.getElementById('heroSearchInput');
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    // Show search results section
    const resultsSection = document.getElementById('searchResultsSection');
    const loadingDiv = document.getElementById('searchLoading');
    const errorDiv = document.getElementById('searchErrorMessage');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const resultsTitle = document.getElementById('searchResultsTitle');

    // Reset UI
    resultsSection.style.display = 'block';
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    resultsContainer.innerHTML = '';
    resultsTitle.textContent = `Search Results for "${query}"`;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        // Call the Supabase Edge Function
        const apiUrl = window.API_URL || 'https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1';
        const response = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Hide loading
        loadingDiv.style.display = 'none';

        // Check if we have results
        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No materials found for "${query}".</p>
                    <p>Try searching for: insulation, lumber, concrete, plywood, or other building materials.</p>
                </div>
            `;
            return;
        }

        // Display results
        resultsContainer.innerHTML = data.results.map(product => createProductCard(product)).join('');

    } catch (error) {
        console.error('Search error:', error);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Search error: ${error.message}. Please try again.`;
    }
}
```

## Product Card Renderer

```javascript
function createProductCard(product) {
    const name = product.name || product.material_name || 'Unknown Product';
    const description = product.description || product.material_description || 'No description available';
    const rating = product.average_rating || product.rating || 0;
    const reviewCount = product.review_count || product.number_of_reviews || 0;
    const carbonFootprint = product.carbon_footprint || product.embodied_carbon || null;
    const merchantName = product.merchant_name || product.name_of_merchant || 'Unknown Merchant';
    const stockLevel = product.stock_level || product.quantity_in_stock || 0;
    const distance = product.distance || null;

    // Format carbon footprint
    let carbonDisplay = '';
    if (carbonFootprint !== null) {
        const carbonValue = parseFloat(carbonFootprint);
        let carbonClass = 'medium';
        if (carbonValue < 15) carbonClass = 'low';
        else if (carbonValue > 30) carbonClass = 'high';
        carbonDisplay = `
            <div class="carbon-stat">
                <span class="label">Carbon Footprint:</span>
                <span class="value ${carbonClass}">${carbonValue.toFixed(1)}kg CO2e</span>
            </div>
        `;
    }

    // Format rating stars
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '★';
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += '½';
        } else {
            starsHtml += '☆';
        }
    }

    // Stock status
    const stockStatus = stockLevel > 0
        ? `<span class="status in-stock">● In Stock (${stockLevel} units)</span>`
        : `<span class="status out-stock">● Out of Stock</span>`;

    // Distance if available
    const distanceDisplay = distance
        ? `<span class="distance">${distance.toFixed(1)} miles away</span>`
        : '';

    return `
        <div class="product-card">
            <div class="product-image">
                <div class="badge-eco">🌿 Building Material</div>
            </div>
            <div class="product-details">
                <h3>${escapeHtml(name)}</h3>
                <p class="product-desc">${escapeHtml(description)}</p>

                <div class="product-meta">
                    <div class="rating">
                        <span class="stars">${starsHtml}</span>
                        <span class="count">(${reviewCount})</span>
                    </div>
                    ${carbonDisplay}
                </div>

                <div class="availability">
                    <div class="store-info">
                        <span class="icon">📍</span>
                        <div>
                            <strong>${escapeHtml(merchantName)}</strong>
                            ${distanceDisplay ? `<span class="distance">${distanceDisplay}</span>` : ''}
                        </div>
                    </div>
                    ${stockStatus}
                </div>

                <button class="btn btn-sm btn-primary full-width" onclick="handleReserveFromSearch('${escapeHtml(name)}')">
                    Reserve for Pickup
                </button>
            </div>
        </div>
    `;
}
```

## Helper Functions

```javascript
// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close search results
function closeSearchResults() {
    const resultsSection = document.getElementById('searchResultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
}

// Reserve from search results
function handleReserveFromSearch(productName) {
    const appUrl = window.APP_BASE_URL || 'http://localhost:3000';
    alert(`Redirecting to app to reserve: ${productName}`);
    window.location.href = `${appUrl}/search`;
}
```

## HTML Structure

```html
<!-- Search Input -->
<div class="hero-search">
    <input type="text" id="heroSearchInput" placeholder="Search for materials..." class="hero-search-input" />
    <button onclick="handleHeroSearch()" class="btn btn-primary btn-search">Search</button>
</div>

<!-- Search Results Section -->
<div id="searchResultsSection" class="search-results-section" style="display: none;">
    <div class="search-results-header">
        <h3 id="searchResultsTitle">Search Results</h3>
        <button onclick="closeSearchResults()" class="btn-close" aria-label="Close results">✕</button>
    </div>
    <div id="searchLoading" class="search-loading" style="display: none;">
        <div class="spinner"></div>
        <p>Searching materials...</p>
    </div>
    <div id="searchErrorMessage" class="search-error" style="display: none;"></div>
    <div id="searchResultsContainer" class="search-results-container"></div>
</div>
```

## API Endpoint

**URL:** `https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1/search`

**Example Call:**
```javascript
fetch('https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1/search?q=insulation', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data.results));
```

**Expected Response:**
```json
{
  "results": [
    {
      "name": "Recycled Insulation Roll",
      "description": "High-performance thermal insulation",
      "average_rating": 4.5,
      "review_count": 128,
      "carbon_footprint": 12.5,
      "merchant_name": "BuildBase - Camden",
      "stock_level": 42,
      "distance": 0.8
    }
  ]
}
```

## Key Features

- ✅ No page redirect - results display inline
- ✅ Real API integration with Supabase
- ✅ Loading states with spinner
- ✅ Error handling
- ✅ XSS protection
- ✅ Responsive grid layout
- ✅ Carbon footprint color-coding
- ✅ Stock availability display
- ✅ Star ratings
- ✅ Merchant info and distance

## File Locations

- HTML: `/Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page/index.html`
- JavaScript: `/Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page/script.js`
- CSS: `/Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page/styles.css`
- Config: `/Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page/config.js`
- Test Page: `/Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page/test-search-live.html`
