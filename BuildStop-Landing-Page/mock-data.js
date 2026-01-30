/**
 * BuildStop Landing Page - Mock Product Data
 * Comprehensive collection of building and construction supplies
 */

const products = [
  // TOOLS
  {
    id: 1,
    name: "DeWalt 20V Max Cordless Drill Kit",
    description: "Professional-grade cordless drill with 2-speed transmission, LED light, and ergonomic grip. Includes 2 batteries and charger.",
    price: 149.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 25,
    rating: 4.8,
    ecoFriendly: false,
    brand: "DeWalt"
  },
  {
    id: 2,
    name: "Milwaukee 25' Tape Measure",
    description: "Heavy-duty tape measure with blade lock, magnetic hook, and fractional scale. Impact-resistant case.",
    price: 24.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 50,
    rating: 4.6,
    ecoFriendly: false,
    brand: "Milwaukee"
  },
  {
    id: 3,
    name: "Eco-Friendly Bamboo Hammer Set (3pc)",
    description: "Sustainable bamboo-handled hammers with recycled steel heads. Includes 8oz, 16oz, and 20oz hammers.",
    price: 39.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop",
    stock: 15,
    rating: 4.7,
    ecoFriendly: true,
    brand: "GreenBuild"
  },
  {
    id: 4,
    name: "Bosch 12" Compound Miter Saw",
    description: "Precision miter saw with bevel controls, dust collection system, and 15-amp motor.",
    price: 399.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop",
    stock: 8,
    rating: 4.9,
    ecoFriendly: false,
    brand: "Bosch"
  },
  {
    id: 5,
    name: "Recycled Steel Socket Wrench Set",
    description: "72-tooth socket wrench set made from 80% recycled steel. Includes metric and SAE sizes.",
    price: 79.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.5,
    ecoFriendly: true,
    brand: "EcoTools"
  },

  // LUMBER
  {
    id: 6,
    name: "2x4 SPF Lumber (8ft)",
    description: "Standard spruce-pine-fir lumber for general construction. Kiln-dried and planed smooth.",
    price: 8.49,
    category: "Lumber",
    image: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400&h=400&fit=crop",
    stock: 200,
    rating: 4.4,
    ecoFriendly: true,
    brand: "BuildStop Basic"
  },
  {
    id: 7,
    name: "FSC-Certified Birch Plywood (1/2in 4x8)",
    description: "Sustainably sourced Baltic birch plywood. Perfect for cabinets, furniture, and interior projects.",
    price: 54.99,
    category: "Lumber",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop",
    stock: 35,
    rating: 4.8,
    ecoFriendly: true,
    brand: "Sustainable Woods"
  },
  {
    id: 8,
    name: "Pressure-Treated 6x6 Post (8ft)",
    description: "Ground contact rated lumber for fences, decks, and outdoor structures. ACQ treated.",
    price: 32.99,
    category: "Lumber",
    image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=400&fit=crop",
    stock: 45,
    rating: 4.5,
    ecoFriendly: false,
    brand: "BuildStop Basic"
  },
  {
    id: 9,
    name: "Reclaimed Oak Barn Wood (sq ft)",
    description: "Authentic reclaimed barn oak with natural weathering. Perfect for accent walls and rustic projects.",
    price: 12.99,
    category: "Lumber",
    image: "https://images.unsplash.com/photo-1520038410233-7141dd7e6f97?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.9,
    ecoFriendly: true,
    brand: "Heritage Woods"
  },
  {
    id: 10,
    name: "Construction Grade 2x6 (10ft)",
    description: "Premium SPF lumber for framing and structural applications. Straight and defect-free.",
    price: 14.99,
    category: "Lumber",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 120,
    rating: 4.3,
    ecoFriendly: true,
    brand: "BuildStop Basic"
  },

  // ELECTRICAL
  {
    id: 11,
    name: "LED Work Light (50W)",
    description: "Energy-efficient LED work light with adjustable stand, 5000LM output, and IP65 waterproof rating.",
    price: 44.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=400&fit=crop",
    stock: 30,
    rating: 4.7,
    ecoFriendly: true,
    brand: "LuxLight"
  },
  {
    id: 12,
    name: "14/2 Romex Wire (250ft)",
    description: "NM-B residential electrical wire with copper conductors and PVC jacket. UL listed.",
    price: 89.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1544724107-6d5c4caaff30?w=400&h=400&fit=crop",
    stock: 60,
    rating: 4.6,
    ecoFriendly: false,
    brand: "Southwire"
  },
  {
    id: 13,
    name: "Smart WiFi Circuit Breaker (20A)",
    description: "Smart circuit breaker with energy monitoring, remote control via app, and overload protection.",
    price: 69.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 18,
    rating: 4.8,
    ecoFriendly: true,
    brand: "SmartBuild"
  },
  {
    id: 14,
    name: "Electrical Outlet Box (Deep)",
    description: "Single-gang vinyl outlet box for new work applications. Includes nails and clamps.",
    price: 2.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
    stock: 150,
    rating: 4.2,
    ecoFriendly: false,
    brand: "Carlon"
  },
  {
    id: 15,
    name: "Solar Panel Mounting Kit",
    description: "Complete mounting system for residential solar panels. Includes rails, clamps, and flashing.",
    price: 199.99,
    category: "Electrical",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.9,
    ecoFriendly: true,
    brand: "SolarPro"
  },

  // PLUMBING
  {
    id: 16,
    name: "PEX Pipe (1/2in 100ft)",
    description: "Flexible PEX tubing for potable water systems. Freeze-resistant and corrosion-proof.",
    price: 67.99,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 75,
    rating: 4.6,
    ecoFriendly: true,
    brand: "Uponor"
  },
  {
    id: 17,
    name: "Low-Flow Showerhead (1.5 GPM)",
    description: "Water-saving showerhead with pressure-optimizing technology. Meets EPA WaterSense standards.",
    price: 29.99,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop",
    stock: 42,
    rating: 4.4,
    ecoFriendly: true,
    brand: "EcoFlow"
  },
  {
    id: 18,
    name: "PVC Pipe (3in 10ft)",
    description: "Schedule 40 PVC pipe for drain, waste, and vent applications. Solvent weld connections.",
    price: 12.99,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 88,
    rating: 4.3,
    ecoFriendly: false,
    brand: "Charlotte Pipe"
  },
  {
    id: 19,
    name: "Tankless Water Heater (7.5 GPM)",
    description: "Energy-efficient gas tankless water heater with condensing technology. 94% thermal efficiency.",
    price: 1299.99,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1585771724684-38223d6639fd?w=400&h=400&fit=crop",
    stock: 5,
    rating: 4.8,
    ecoFriendly: true,
    brand: "Rinnai"
  },
  {
    id: 20,
    name: "Copper Pipe Type M (1/2in 10ft)",
    description: "Type M copper tubing for general residential plumbing. Lead-free and recyclable.",
    price: 24.99,
    category: "Plumbing",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.5,
    ecoFriendly: true,
    brand: "Mueller"
  },

  // PAINT
  {
    id: 21,
    name: "Zero VOC Interior Paint (1 Gallon)",
    description: "Premium zero-VOC paint with no harmful emissions. Low odor, easy cleanup, premium coverage.",
    price: 42.99,
    category: "Paint",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
    stock: 95,
    rating: 4.7,
    ecoFriendly: true,
    brand: "EcoCoat"
  },
  {
    id: 22,
    name: "Exterior Paint + Primer (5 Gallon)",
    description: "All-weather exterior paint with built-in primer. 100% acrylic, mildew-resistant.",
    price: 189.99,
    category: "Paint",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop",
    stock: 22,
    rating: 4.6,
    ecoFriendly: false,
    brand: "BuildStop Pro"
  },
  {
    id: 23,
    name: "Recycled Paint Starter Kit",
    description: "Environmentally friendly paint made from 100% recycled post-consumer paint. Available in 50+ colors.",
    price: 34.99,
    category: "Paint",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 38,
    rating: 4.5,
    ecoFriendly: true,
    brand: "GreenPaint"
  },
  {
    id: 24,
    name: "Paint Roller Kit (Pro Grade)",
    description: "Professional roller kit with 18in frame, 3 covers (3/8, 1/2, 3/4 nap), and tray.",
    price: 29.99,
    category: "Paint",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 55,
    rating: 4.4,
    ecoFriendly: false,
    brand: "Wooster"
  },
  {
    id: 25,
    name: "Milk Paint (Quart)",
    description: "Traditional milk paint made from organic ingredients. Zero VOC, biodegradable, long-lasting finish.",
    price: 24.99,
    category: "Paint",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.8,
    ecoFriendly: true,
    brand: "Old Fashioned Milk Paint"
  },

  // FLOORING
  {
    id: 26,
    name: "Bamboo Hardwood Flooring (sq ft)",
    description: "Sustainable strand-woven bamboo flooring. 14mm thick, click-lock installation, carbonized color.",
    price: 5.99,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop",
    stock: 850,
    rating: 4.7,
    ecoFriendly: true,
    brand: "Ambient"
  },
  {
    id: 27,
    name: "Cork Flooring Tiles (sq ft)",
    description: "Natural cork flooring with acoustic insulation. Warm underfoot, renewable material.",
    price: 6.49,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=400&h=400&fit=crop",
    stock: 620,
    rating: 4.6,
    ecoFriendly: true,
    brand: "CorkHouse"
  },
  {
    id: 28,
    name: "Luxury Vinyl Plank (sq ft)",
    description: "Waterproof LVP with realistic wood grain. 6mm thick, integrated underlayment, lifetime warranty.",
    price: 3.99,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    stock: 1200,
    rating: 4.5,
    ecoFriendly: false,
    brand: "BuildStop Flooring"
  },
  {
    id: 29,
    name: "Recycled Glass Tile (sq ft)",
    description: "Eco-friendly mosaic tiles made from 100% recycled glass. Perfect for backsplashes and accents.",
    price: 18.99,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.8,
    ecoFriendly: true,
    brand: "EcoTile"
  },
  {
    id: 30,
    name: "Ceramic Tile (12x12, sq ft)",
    description: "Classic ceramic floor tile with matte finish. Durable, easy to clean, suitable for all rooms.",
    price: 2.99,
    category: "Flooring",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 2400,
    rating: 4.3,
    ecoFriendly: false,
    brand: "Daltile"
  },

  // INSULATION
  {
    id: 31,
    name: "Recycled Denim Insulation (Batt)",
    description: "Eco-friendly insulation made from recycled denim. R-13, formaldehyde-free, safe to handle.",
    price: 54.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 65,
    rating: 4.8,
    ecoFriendly: true,
    brand: "Bonded Logic"
  },
  {
    id: 32,
    name: "Spray Foam Insulation Kit (600 board ft)",
    description: "Closed-cell spray foam kit with high R-value. Air barrier + moisture barrier in one application.",
    price: 499.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 12,
    rating: 4.7,
    ecoFriendly: false,
    brand: "Touch n Seal"
  },
  {
    id: 33,
    name: "Cellulose Insulation (40 lb bag)",
    description: "Blown-in cellulose insulation made from 85% recycled paper. Treated for fire and pest resistance.",
    price: 28.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400&h=400&fit=crop",
    stock: 180,
    rating: 4.5,
    ecoFriendly: true,
    brand: "GreenFiber"
  },
  {
    id: 34,
    name: "Rigid Foam Board (2in 4x8)",
    description: "Extruded polystyrene insulation board. R-10, moisture-resistant, for foundations and slabs.",
    price: 32.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 85,
    rating: 4.4,
    ecoFriendly: false,
    brand: "Owens Corning"
  },
  {
    id: 35,
    name: "Sheep Wool Insulation (Batt)",
    description: "Natural wool insulation with R-13. Renewable, biodegradable, excellent moisture management.",
    price: 72.99,
    category: "Insulation",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.9,
    ecoFriendly: true,
    brand: "Havelock Wool"
  },

  // ROOFING
  {
    id: 36,
    name: "Architectural Shingles (Bundle)",
    description: "High-definition asphalt shingles with 30-year warranty. Algae-resistant, Class 4 hail rating.",
    price: 34.99,
    category: "Roofing",
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=400&fit=crop",
    stock: 150,
    rating: 4.6,
    ecoFriendly: false,
    brand: "GAF"
  },
  {
    id: 37,
    name: "Metal Roofing Panel (12ft)",
    description: "Standing seam metal roofing in galvalume steel. 40-year warranty, 100% recyclable.",
    price: 89.99,
    category: "Roofing",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 220,
    rating: 4.7,
    ecoFriendly: true,
    brand: "BuildStop Metal"
  },
  {
    id: 38,
    name: "Solar Roof Shingle (Square)",
    description: "Integrated solar shingle that generates electricity while protecting your home. 25W per shingle.",
    price: 299.99,
    category: "Roofing",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.9,
    ecoFriendly: true,
    brand: "Tesla Solar"
  },
  {
    id: 39,
    name: "Synthetic Underlayment Roll (10 sq ft)",
    description: "Synthetic roofing underlayment. Superior to felt, lightweight, tear-resistant, 50-year warranty.",
    price: 149.99,
    category: "Roofing",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 45,
    rating: 4.5,
    ecoFriendly: false,
    brand: "GAF"
  },
  {
    id: 40,
    name: "Green Roof System Kit (100 sq ft)",
    description: "Complete modular green roof system with trays, soil, and drought-resistant sedum plants.",
    price: 449.99,
    category: "Roofing",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 8,
    rating: 4.8,
    ecoFriendly: true,
    brand: "GreenGrid"
  },

  // HARDWARE
  {
    id: 41,
    name: "Stainless Steel Hinge (3.5in)",
    description: "Heavy-duty door hinge with removable pin. 5/8in radius corner, residential grade.",
    price: 4.99,
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 200,
    rating: 4.4,
    ecoFriendly: true,
    brand: "BuildStop Hardware"
  },
  {
    id: 42,
    name: "Smart Lock Pro (Keyless Entry)",
    description: "WiFi-enabled deadbolt with fingerprint, keypad, and smartphone access. Auto-lock feature.",
    price: 199.99,
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 28,
    rating: 4.7,
    ecoFriendly: false,
    brand: "August"
  },
  {
    id: 43,
    name: "Recycled Aluminum Door Handle",
    description: "Modern door handle made from 80% recycled aluminum. Universal backset, reversible handing.",
    price: 34.99,
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 55,
    rating: 4.5,
    ecoFriendly: true,
    brand: "EcoHardware"
  },
  {
    id: 44,
    name: "Heavy-Duty Drawer Slide (24in)",
    description: "Soft-close ball-bearing drawer slide. 100lb capacity, full extension, side mount.",
    price: 18.99,
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.6,
    ecoFriendly: false,
    brand: "Accuride"
  },
  {
    id: 45,
    name: "Door Weatherstripping Kit",
    description: "Energy-saving door weatherstrip with triple sealing. Reduces drafts, lowers heating/cooling costs.",
    price: 19.99,
    category: "Hardware",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 95,
    rating: 4.3,
    ecoFriendly: true,
    brand: "Frost King"
  },

  // FASTENERS
  {
    id: 46,
    name: "Structural Screws (1lb Box)",
    description: "Heavy-duty wood screws for structural applications. Type 17 point, corrosion-resistant coating.",
    price: 24.99,
    category: "Fasteners",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 120,
    rating: 4.7,
    ecoFriendly: false,
    brand: "GRK"
  },
  {
    id: 47,
    name: "Ring Shank Nails (1lb)",
    description: "Galvanized ring shank nails for outdoor use. Superior holding power in softwoods.",
    price: 9.99,
    category: "Fasteners",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    stock: 180,
    rating: 4.4,
    ecoFriendly: false,
    brand: "BuildStop"
  },
  {
    id: 48,
    name: "Hex Bolts Assortment (150pc)",
    description: "Complete hex bolt assortment in common sizes. Zinc-plated steel, includes nuts and washers.",
    price: 29.99,
    category: "Fasteners",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    stock: 42,
    rating: 4.5,
    ecoFriendly: false,
    brand: "BuildStop"
  },
  {
    id: 49,
    name: "Recycled Steel Anchor Kit",
    description: "Wall anchors made from 70% recycled steel. Includes various sizes for drywall and concrete.",
    price: 14.99,
    category: "Fasteners",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    stock: 75,
    rating: 4.3,
    ecoFriendly: true,
    brand: "EcoFasteners"
  },
  {
    id: 50,
    name: "Deck Screws (5lb Box)",
    description: "Coated deck screws for exterior use. Type 17 point, star drive, corrosion-resistant.",
    price: 44.99,
    category: "Fasteners",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=400&fit=crop",
    stock: 0,
    rating: 4.6,
    ecoFriendly: false,
    brand: "BuildStop Pro"
  }
];

// Category constants for easy reference
const CATEGORIES = {
  TOOLS: "Tools",
  LUMBER: "Lumber",
  ELECTRICAL: "Electrical",
  PLUMBING: "Plumbing",
  PAINT: "Paint",
  FLOORING: "Flooring",
  INSULATION: "Insulation",
  ROOFING: "Roofing",
  HARDWARE: "Hardware",
  FASTENERS: "Fasteners"
};

// Helper functions for data manipulation
const getProductsByCategory = (category) => {
  return products.filter(p => p.category === category);
};

const getEcoFriendlyProducts = () => {
  return products.filter(p => p.ecoFriendly === true);
};

const getInStockProducts = () => {
  return products.filter(p => p.stock > 0);
};

const getOutOfStockProducts = () => {
  return products.filter(p => p.stock === 0);
};

const getProductById = (id) => {
  return products.find(p => p.id === id);
};

const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery)
  );
};

const getProductsByPriceRange = (min, max) => {
  return products.filter(p => p.price >= min && p.price <= max);
};

// Statistics
const getProductStats = () => {
  const totalProducts = products.length;
  const inStock = products.filter(p => p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const ecoFriendly = products.filter(p => p.ecoFriendly).length;
  const avgRating = (products.reduce((sum, p) => sum + p.rating, 0) / totalProducts).toFixed(1);

  const categoryCounts = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return {
    totalProducts,
    inStock,
    outOfStock,
    ecoFriendly,
    avgRating,
    categoryCounts,
    categories: Object.keys(CATEGORIES).map(key => CATEGORIES[key])
  };
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    products,
    CATEGORIES,
    getProductsByCategory,
    getEcoFriendlyProducts,
    getInStockProducts,
    getOutOfStockProducts,
    getProductById,
    searchProducts,
    getProductsByPriceRange,
    getProductStats
  };
}

// Browser global fallback
if (typeof window !== 'undefined') {
  window.BuildStopMockData = {
    products,
    CATEGORIES,
    getProductsByCategory,
    getEcoFriendlyProducts,
    getInStockProducts,
    getOutOfStockProducts,
    getProductById,
    searchProducts,
    getProductsByPriceRange,
    getProductStats
  };
}
