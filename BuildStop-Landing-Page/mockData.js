/**
 * BuildStop Pro - Mock Product Data
 * Sample construction materials data for demonstration
 */

const mockProducts = [
    {
        id: 1,
        name: 'Recycled Insulation Roll',
        description: 'High-performance thermal insulation made from 80% recycled glass. Significantly reduces heat loss.',
        price: 24.99,
        category: 'Insulation',
        ecoFriendly: true,
        carbonFootprint: 12,
        rating: 4.5,
        reviewCount: 128,
        image: '📦',
        inStock: true,
        stockCount: 42,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 2,
        name: 'Bamboo Plywood Sheet',
        description: 'Sustainable bamboo plywood alternative to traditional hardwood. Perfect for interior applications.',
        price: 45.00,
        category: 'Lumber',
        ecoFriendly: true,
        carbonFootprint: 8,
        rating: 4.8,
        reviewCount: 95,
        image: '🪵',
        inStock: true,
        stockCount: 28,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 3,
        name: 'Low-Carbon Concrete Mix',
        description: 'Reduced carbon footprint concrete with 40% fewer emissions than standard mixes.',
        price: 12.50,
        category: 'Concrete',
        ecoFriendly: true,
        carbonFootprint: 35,
        rating: 4.3,
        reviewCount: 67,
        image: '🧱',
        inStock: true,
        stockCount: 150,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    },
    {
        id: 4,
        name: 'Solar Roof Tiles',
        description: 'Integrated solar photovoltaic roof tiles that generate clean energy while protecting your home.',
        price: 89.99,
        category: 'Roofing',
        ecoFriendly: true,
        carbonFootprint: 45,
        rating: 4.9,
        reviewCount: 203,
        image: '☀️',
        inStock: true,
        stockCount: 200,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 5,
        name: 'Reclaimed Timber Beams',
        description: 'Beautiful reclaimed oak beams sourced from demolished buildings. Full character and history.',
        price: 120.00,
        category: 'Lumber',
        ecoFriendly: true,
        carbonFootprint: 5,
        rating: 4.7,
        reviewCount: 54,
        image: '🪵',
        inStock: true,
        stockCount: 15,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 6,
        name: 'Recycled Steel Framing',
        description: 'Light gauge steel framing made from 100% recycled steel. Durable and fire-resistant.',
        price: 38.75,
        category: 'Metal',
        ecoFriendly: true,
        carbonFootprint: 22,
        rating: 4.4,
        reviewCount: 89,
        image: '🔧',
        inStock: true,
        stockCount: 75,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    },
    {
        id: 7,
        name: 'Natural Cork Flooring',
        description: 'Sustainable cork flooring harvested without harming trees. Warm, comfortable, and acoustic.',
        price: 32.50,
        category: 'Flooring',
        ecoFriendly: true,
        carbonFootprint: 6,
        rating: 4.6,
        reviewCount: 112,
        image: '🟫',
        inStock: true,
        stockCount: 45,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 8,
        name: 'Water-Based Paint',
        description: 'Low VOC, eco-friendly interior paint. Available in 50+ colors with minimal odor.',
        price: 28.99,
        category: 'Paint',
        ecoFriendly: true,
        carbonFootprint: 4,
        rating: 4.2,
        reviewCount: 234,
        image: '🎨',
        inStock: true,
        stockCount: 120,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 9,
        name: 'Sheep Wool Insulation',
        description: 'Natural sheep wool insulation batting. Breathable, renewable, and excellent thermal performance.',
        price: 35.00,
        category: 'Insulation',
        ecoFriendly: true,
        carbonFootprint: 3,
        rating: 4.8,
        reviewCount: 76,
        image: '🐑',
        inStock: true,
        stockCount: 60,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    },
    {
        id: 10,
        name: 'Composite Decking Boards',
        description: 'Recycled plastic and wood fiber composite decking. Low maintenance and long-lasting.',
        price: 55.00,
        category: 'Decking',
        ecoFriendly: true,
        carbonFootprint: 18,
        rating: 4.5,
        reviewCount: 148,
        image: '🪜',
        inStock: true,
        stockCount: 90,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 11,
        name: 'Clay Roof Tiles',
        description: 'Traditional clay tiles with modern eco-friendly manufacturing process.',
        price: 2.50,
        category: 'Roofing',
        ecoFriendly: true,
        carbonFootprint: 15,
        rating: 4.4,
        reviewCount: 92,
        image: '🏠',
        inStock: true,
        stockCount: 500,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 12,
        name: 'Recycled Glass Countertops',
        description: 'Beautiful countertops made from 100% recycled glass and resin. Unique and durable.',
        price: 185.00,
        category: 'Countertops',
        ecoFriendly: true,
        carbonFootprint: 25,
        rating: 4.7,
        reviewCount: 67,
        image: '✨',
        inStock: true,
        stockCount: 12,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    }
];

// Get all unique categories
function getCategories() {
    return [...new Set(mockProducts.map(p => p.category))].sort();
}

// Get products by category (sorted by price lowest to highest)
function getProductsByCategory(category) {
    let products = category === 'All'
        ? [...mockProducts]
        : mockProducts.filter(p => p.category === category);

    // Sort by price (lowest to highest)
    return products.sort((a, b) => a.price - b.price);
}

// Search products
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return mockProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
}

// Make available globally
window.mockProducts = mockProducts.sort((a, b) => a.price - b.price); // Always sorted by price
window.getCategories = getCategories;
window.getProductsByCategory = getProductsByCategory;
window.searchProducts = searchProducts;
