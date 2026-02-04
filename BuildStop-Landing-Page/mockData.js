/**
 * BuildStop Pro - Mock Product Data
 * Sample construction materials data for demonstration
 */

const mockProducts = [
    // INSULATION
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
        id: 13,
        name: 'Spray Foam Insulation Kit',
        description: 'Expanding polyurethane foam insulation for sealing gaps and cavities. Professional grade.',
        price: 45.99,
        category: 'Insulation',
        ecoFriendly: false,
        carbonFootprint: 28,
        rating: 4.6,
        reviewCount: 89,
        image: '🧴',
        inStock: true,
        stockCount: 35,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },

    // LUMBER
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
        id: 14,
        name: 'CLT Timber Panels',
        description: 'Cross Laminated Timber structural panels. Strong, sustainable alternative to concrete.',
        price: 89.50,
        category: 'Lumber',
        ecoFriendly: true,
        carbonFootprint: 10,
        rating: 4.9,
        reviewCount: 42,
        image: '🪵',
        inStock: true,
        stockCount: 22,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 15,
        name: 'Treated Softwood Planks',
        description: 'Pressure-treated pine planks for outdoor use. Resistant to rot and insects.',
        price: 18.75,
        category: 'Lumber',
        ecoFriendly: false,
        carbonFootprint: 15,
        rating: 4.3,
        reviewCount: 167,
        image: '🪵',
        inStock: true,
        stockCount: 120,
        store: 'Wickes - Hackney',
        distance: 2.8
    },

    // TOOLS
    {
        id: 16,
        name: 'Cordless Power Drill 18V',
        description: 'Professional grade cordless drill with two batteries and fast charger. Brushless motor.',
        price: 89.99,
        category: 'Tools',
        ecoFriendly: false,
        carbonFootprint: 18,
        rating: 4.7,
        reviewCount: 342,
        image: '🔧',
        inStock: true,
        stockCount: 25,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },
    {
        id: 17,
        name: 'Ergonomic Hammer Set',
        description: 'Set of 3 hammers with fibreglass handles. Claw, club, and sledgehammer included.',
        price: 34.50,
        category: 'Tools',
        ecoFriendly: false,
        carbonFootprint: 8,
        rating: 4.5,
        reviewCount: 128,
        image: '🔨',
        inStock: true,
        stockCount: 45,
        store: 'Toolstation - Dalston',
        distance: 1.9
    },
    {
        id: 18,
        name: 'Recycled Plastic Spirit Level',
        description: '600mm spirit level made from 100% recycled plastic. High accuracy vials.',
        price: 12.99,
        category: 'Tools',
        ecoFriendly: true,
        carbonFootprint: 3,
        rating: 4.4,
        reviewCount: 76,
        image: '📏',
        inStock: true,
        stockCount: 68,
        store: 'B&Q - Bow',
        distance: 3.2
    },
    {
        id: 19,
        name: 'Solar Power Tool Charger',
        description: 'Portable solar panel for charging cordless tool batteries. 50W output.',
        price: 65.00,
        category: 'Tools',
        ecoFriendly: true,
        carbonFootprint: 12,
        rating: 4.6,
        reviewCount: 54,
        image: '☀️',
        inStock: true,
        stockCount: 18,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 20,
        name: 'Bioplastic Hand Saw',
        description: 'Hand saw with blade made from plant-based bioplastic. Sharp and durable.',
        price: 15.99,
        category: 'Tools',
        ecoFriendly: true,
        carbonFootprint: 4,
        rating: 4.2,
        reviewCount: 38,
        image: '🪚',
        inStock: true,
        stockCount: 52,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },

    // ELECTRICAL
    {
        id: 21,
        name: 'LED Smart Bulb Pack',
        description: 'Pack of 4 smart LED bulbs with WiFi control. 800 lumens, adjustable color temperature.',
        price: 32.99,
        category: 'Electrical',
        ecoFriendly: true,
        carbonFootprint: 6,
        rating: 4.8,
        reviewCount: 456,
        image: '💡',
        inStock: true,
        stockCount: 85,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },
    {
        id: 22,
        name: 'Recycled Copper Wiring',
        description: 'Electrical wiring made from 100% recycled copper. 2.5mm twin and earth, 100m drum.',
        price: 78.50,
        category: 'Electrical',
        ecoFriendly: true,
        carbonFootprint: 12,
        rating: 4.6,
        reviewCount: 89,
        image: '⚡',
        inStock: true,
        stockCount: 30,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 23,
        name: 'Smart Thermostat',
        description: 'WiFi-enabled programmable thermostat. Learns your schedule to save energy.',
        price: 145.00,
        category: 'Electrical',
        ecoFriendly: true,
        carbonFootprint: 9,
        rating: 4.9,
        reviewCount: 234,
        image: '🌡️',
        inStock: true,
        stockCount: 22,
        store: 'Toolstation - Dalston',
        distance: 1.9
    },
    {
        id: 24,
        name: 'Solar Motion Sensor Light',
        description: 'Outdoor security light with solar panel and motion detector. No wiring needed.',
        price: 29.99,
        category: 'Electrical',
        ecoFriendly: true,
        carbonFootprint: 8,
        rating: 4.5,
        reviewCount: 167,
        image: '💡',
        inStock: true,
        stockCount: 55,
        store: 'B&Q - Bow',
        distance: 3.2
    },

    // PLUMBING
    {
        id: 25,
        name: 'Low-Flow Shower Head',
        description: 'Water-saving showerhead with multiple spray settings. Saves 50% water.',
        price: 24.99,
        category: 'Plumbing',
        ecoFriendly: true,
        carbonFootprint: 4,
        rating: 4.4,
        reviewCount: 198,
        image: '🚿',
        inStock: true,
        stockCount: 72,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },
    {
        id: 26,
        name: 'Recycled Copper Pipe',
        description: '15mm copper pipe made from 100% recycled material. 3m length.',
        price: 12.50,
        category: 'Plumbing',
        ecoFriendly: true,
        carbonFootprint: 6,
        rating: 4.6,
        reviewCount: 87,
        image: '🔧',
        inStock: true,
        stockCount: 95,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },
    {
        id: 27,
        name: 'Dual Flush Toilet Cistern',
        description: 'Water-saving dual flush cistern. 3/6 litre flush options. Easy to install.',
        price: 89.00,
        category: 'Plumbing',
        ecoFriendly: true,
        carbonFootprint: 15,
        rating: 4.7,
        reviewCount: 123,
        image: '🚽',
        inStock: true,
        stockCount: 18,
        store: 'Wickes - Hackney',
        distance: 2.8
    },
    {
        id: 28,
        name: 'Greywater Recycling System',
        description: 'Complete system for recycling bath and shower water to flush toilets. Saves 30% water.',
        price: 495.00,
        category: 'Plumbing',
        ecoFriendly: true,
        carbonFootprint: 25,
        rating: 4.8,
        reviewCount: 45,
        image: '♻️',
        inStock: true,
        stockCount: 8,
        store: 'BuildBase - Camden',
        distance: 0.8
    },

    // PAINT
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
        id: 29,
        name: 'Recycled Paint Range',
        description: 'Interior paint made from 50% recycled content. Zero VOC and excellent coverage.',
        price: 34.99,
        category: 'Paint',
        ecoFriendly: true,
        carbonFootprint: 5,
        rating: 4.5,
        reviewCount: 145,
        image: '🎨',
        inStock: true,
        stockCount: 68,
        store: 'B&Q - Bow',
        distance: 3.2
    },
    {
        id: 30,
        name: 'Exterior Masonry Paint',
        description: 'Weatherproof masonry paint with 15 year guarantee. Self-cleaning technology.',
        price: 42.50,
        category: 'Paint',
        ecoFriendly: false,
        carbonFootprint: 12,
        rating: 4.6,
        reviewCount: 89,
        image: '🏠',
        inStock: true,
        stockCount: 45,
        store: 'Wickes - Hackney',
        distance: 2.8
    },

    // FLOORING
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
        id: 31,
        name: 'Recycled Rubber Tiles',
        description: 'Flooring tiles made from recycled tyres. Durable, water-resistant, perfect for gyms.',
        price: 28.99,
        category: 'Flooring',
        ecoFriendly: true,
        carbonFootprint: 8,
        rating: 4.4,
        reviewCount: 67,
        image: '◽',
        inStock: true,
        stockCount: 58,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 32,
        name: 'Bamboo Flooring Planks',
        description: 'Solid bamboo flooring with click-lock system. 14mm thick, carbonized finish.',
        price: 45.00,
        category: 'Flooring',
        ecoFriendly: true,
        carbonFootprint: 10,
        rating: 4.7,
        reviewCount: 93,
        image: '🟫',
        inStock: true,
        stockCount: 38,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },

    // ROOFING
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
        id: 33,
        name: 'Green Roof System',
        description: 'Complete green roof kit with sedum mats, drainage layer, and waterproof membrane.',
        price: 45.00,
        category: 'Roofing',
        ecoFriendly: true,
        carbonFootprint: 12,
        rating: 4.8,
        reviewCount: 56,
        image: '🌱',
        inStock: true,
        stockCount: 35,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    },
    {
        id: 34,
        name: 'Recycled Plastic Shingles',
        description: 'Roof shingles made from 100% recycled plastic. 50 year lifespan, maintenance-free.',
        price: 38.50,
        category: 'Roofing',
        ecoFriendly: true,
        carbonFootprint: 14,
        rating: 4.5,
        reviewCount: 41,
        image: '🏠',
        inStock: true,
        stockCount: 68,
        store: 'Wickes - Hackney',
        distance: 2.8
    },

    // CONCRETE
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
        id: 35,
        name: 'Recycled Aggregate',
        description: 'Crushed concrete aggregate for sub-base and drainage. 100% recycled content.',
        price: 28.00,
        category: 'Concrete',
        ecoFriendly: true,
        carbonFootprint: 8,
        rating: 4.6,
        reviewCount: 83,
        image: '🪨',
        inStock: true,
        stockCount: 200,
        store: 'Travis Perkins - Islington',
        distance: 1.2
    },

    // METAL
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
        id: 36,
        name: 'Aluminium Sheet Recycled',
        description: '2mm aluminium sheet made from 95% recycled content. Corrosion resistant.',
        price: 45.00,
        category: 'Metal',
        ecoFriendly: true,
        carbonFootprint: 15,
        rating: 4.5,
        reviewCount: 52,
        image: '🔩',
        inStock: true,
        stockCount: 42,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },

    // DECKING
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
        id: 37,
        name: 'Hardwood Decking FSC Certified',
        description: 'FSC certified balau hardwood decking boards. Naturally durable and beautiful.',
        price: 68.00,
        category: 'Decking',
        ecoFriendly: true,
        carbonFootprint: 12,
        rating: 4.7,
        reviewCount: 94,
        image: '🪜',
        inStock: true,
        stockCount: 65,
        store: 'BuildBase - Camden',
        distance: 0.8
    },

    // COUNTERTOPS
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
    },
    {
        id: 38,
        name: 'Bamboo Butcher Block',
        description: 'Butcher block countertop made from sustainable bamboo. Food-safe finish.',
        price: 145.00,
        category: 'Countertops',
        ecoFriendly: true,
        carbonFootprint: 8,
        rating: 4.6,
        reviewCount: 83,
        image: '🟫',
        inStock: true,
        stockCount: 18,
        store: 'BuildBase - Camden',
        distance: 0.8
    },

    // HARDWARE
    {
        id: 39,
        name: 'Recycled Steel Screws Pack',
        description: 'Assorted screws made from 100% recycled steel. 200 piece pack.',
        price: 12.99,
        category: 'Hardware',
        ecoFriendly: true,
        carbonFootprint: 4,
        rating: 4.4,
        reviewCount: 156,
        image: '🔩',
        inStock: true,
        stockCount: 120,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },
    {
        id: 40,
        name: 'Bioplastic Door Handles',
        description: 'Door handles made from plant-based bioplastic. Set of 3.',
        price: 18.50,
        category: 'Hardware',
        ecoFriendly: true,
        carbonFootprint: 3,
        rating: 4.3,
        reviewCount: 72,
        image: '🚪',
        inStock: true,
        stockCount: 45,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 41,
        name: 'Recycled Aluminium Hinges',
        description: 'Door hinges made from 90% recycled aluminium. Soft-close mechanism.',
        price: 8.99,
        category: 'Hardware',
        ecoFriendly: true,
        carbonFootprint: 5,
        rating: 4.5,
        reviewCount: 94,
        image: '🔧',
        inStock: true,
        stockCount: 85,
        store: 'Jewson - Kings Cross',
        distance: 1.5
    },

    // FASTENERS
    {
        id: 42,
        name: 'Recycled Steel Nails',
        description: 'Round wire nails made from 100% recycled steel. 500g pack.',
        price: 6.99,
        category: 'Fasteners',
        ecoFriendly: true,
        carbonFootprint: 2,
        rating: 4.6,
        reviewCount: 203,
        image: '🔨',
        inStock: true,
        stockCount: 150,
        store: 'Screwfix - Holloway',
        distance: 2.1
    },
    {
        id: 43,
        name: 'Biocompatible Wall Plugs',
        description: 'Wall plugs made from biodegradable bioplastic. 100 piece pack.',
        price: 7.50,
        category: 'Fasteners',
        ecoFriendly: true,
        carbonFootprint: 2,
        rating: 4.4,
        reviewCount: 87,
        image: '🔩',
        inStock: true,
        stockCount: 95,
        store: 'BuildBase - Camden',
        distance: 0.8
    },
    {
        id: 44,
        name: 'Recycled Steel Bolts Set',
        description: 'Assorted bolts made from 100% recycled steel. 150 piece set.',
        price: 22.99,
        category: 'Fasteners',
        ecoFriendly: true,
        carbonFootprint: 6,
        rating: 4.5,
        reviewCount: 118,
        image: '🔧',
        inStock: true,
        stockCount: 70,
        store: 'Toolstation - Dalston',
        distance: 1.9
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
