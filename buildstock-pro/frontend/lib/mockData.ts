import { Product, SearchFilters, SearchResults } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Recycled Insulation Roll',
    description: 'High-performance thermal insulation made from 80% recycled glass. Significantly reduces heat loss and energy consumption.',
    category: 'Insulation',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1581578731117-104f2a41232c?w=800&q=80',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80'
    ],
    price: 24.99,
    unit: 'roll',
    stock: {
      level: 'in-stock',
      quantity: 42,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 12,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['Energy Star', 'LEED Compliant'],
    },
    rating: {
      average: 4.5,
      count: 128,
    },
    suppliers: [
      {
        id: 's1',
        name: 'BuildBase - Camden',
        address: '123 Camden High Street',
        distance: 0.8,
        phone: '020 7123 4567',
        website: 'https://buildbase.co.uk',
        stock: 42,
        sameDayCollection: true,
      },
      {
        id: 's2',
        name: 'Travis Perkins - Kings Cross',
        address: '456 York Way',
        distance: 1.2,
        phone: '020 7234 5678',
        website: 'https://travisperkins.com',
        stock: 28,
        sameDayCollection: true,
      },
    ],
    location: {
      latitude: 51.5412,
      longitude: -0.1468,
    },
    tags: ['insulation', 'eco-friendly', 'thermal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'FSC-Certified Plywood Sheet',
    description: 'Structural grade plywood from responsibly managed forests. Perfect for roofing, flooring, and wall sheathing.',
    category: 'Timber',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80',
      'https://images.unsplash.com/photo-1590694483197-1633e77c5767?w=800&q=80'
    ],
    price: 45.00,
    unit: 'sheet',
    stock: {
      level: 'in-stock',
      quantity: 28,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 25,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['FSC Certified'],
    },
    rating: {
      average: 4.8,
      count: 95,
    },
    suppliers: [
      {
        id: 's3',
        name: 'Travis Perkins - Kings Cross',
        address: '456 York Way',
        distance: 1.2,
        phone: '020 7234 5678',
        website: 'https://travisperkins.com',
        stock: 28,
        sameDayCollection: true,
      },
    ],
    location: {
      latitude: 51.5375,
      longitude: -0.1245,
    },
    tags: ['plywood', 'fsc', 'structural'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Low-VOC Interior Paint',
    description: 'Premium interior paint with minimal volatile organic compounds. Available in 50+ colors for any interior space.',
    category: 'Paints',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80'
    ],
    price: 32.50,
    unit: 'gallon',
    stock: {
      level: 'low-stock',
      quantity: 5,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 8,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'B',
      certifications: ['ISO 14001'],
    },
    rating: {
      average: 4.3,
      count: 67,
    },
    suppliers: [
      {
        id: 's4',
        name: 'HomeBase - Holloway',
        address: '789 Holloway Road',
        distance: 2.1,
        phone: '020 7345 6789',
        website: 'https://homebase.co.uk',
        stock: 5,
      },
    ],
    location: {
      latitude: 51.5517,
      longitude: -0.1134,
    },
    tags: ['paint', 'low-voc', 'interior'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Solar Reflective Roof Tiles',
    description: 'Energy-efficient roof tiles that reflect sunlight and reduce cooling costs by up to 20%.',
    category: 'Roofing',
    images: [
      'https://images.unsplash.com/photo-1632759145681-e04c3d9f06ce?w=800&q=80',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
    ],
    price: 89.99,
    unit: 'sq.m',
    stock: {
      level: 'in-stock',
      quantity: 150,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 45,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['Energy Star', 'LEED Compliant'],
    },
    rating: {
      average: 4.7,
      count: 203,
    },
    suppliers: [
      {
        id: 's5',
        name: 'BuildBase - Camden',
        address: '123 Camden High Street',
        distance: 0.8,
        phone: '020 7123 4567',
        website: 'https://buildbase.co.uk',
        stock: 150,
      },
    ],
    location: {
      latitude: 51.5412,
      longitude: -0.1468,
    },
    tags: ['roofing', 'solar', 'energy-efficient'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Bamboo Flooring Panels',
    description: 'Sustainable bamboo flooring with natural finish. Rapidly renewable material with excellent durability.',
    category: 'Flooring',
    images: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80',
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    price: 67.50,
    unit: 'sq.m',
    stock: {
      level: 'out-of-stock',
      quantity: 0,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 18,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['FSC Certified', 'PEFC Certified'],
    },
    rating: {
      average: 4.6,
      count: 89,
    },
    suppliers: [
      {
        id: 's6',
        name: 'Screwfix - Islington',
        address: '321 Upper Street',
        distance: 1.5,
        phone: '020 7456 7890',
        website: 'https://screwfix.com',
        stock: 0,
      },
    ],
    location: {
      latitude: 51.5465,
      longitude: -0.1038,
    },
    tags: ['flooring', 'bamboo', 'sustainable'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Recycled Steel Studs',
    description: 'Lightweight steel wall studs made from 100% recycled steel. Rust-resistant and fire-rated.',
    category: 'Drywall',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    price: 12.99,
    unit: 'piece',
    stock: {
      level: 'in-stock',
      quantity: 500,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 5,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['LEED Compliant'],
    },
    rating: {
      average: 4.4,
      count: 156,
    },
    suppliers: [
      {
        id: 's7',
        name: 'Wickes - Angel',
        address: '556 Liverpool Road',
        distance: 2.8,
        phone: '020 7567 8901',
        website: 'https://wickes.co.uk',
        stock: 500,
      },
    ],
    location: {
      latitude: 51.5328,
      longitude: -0.1057,
    },
    tags: ['steel', 'recycled', 'fire-rated'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Water-Based Exterior Wood Stain',
    description: 'Eco-friendly wood stain with UV protection. Low odor and easy cleanup with water.',
    category: 'Paints',
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    price: 28.75,
    unit: 'liter',
    stock: {
      level: 'in-stock',
      quantity: 35,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 6,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'B',
      certifications: ['ISO 14001'],
    },
    rating: {
      average: 4.2,
      count: 78,
    },
    suppliers: [
      {
        id: 's8',
        name: 'HomeBase - Holloway',
        address: '789 Holloway Road',
        distance: 2.1,
        phone: '020 7345 6789',
        website: 'https://homebase.co.uk',
        stock: 35,
      },
    ],
    location: {
      latitude: 51.5517,
      longitude: -0.1134,
    },
    tags: ['stain', 'exterior', 'water-based'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Hempcrete Insulation Blocks',
    description: 'Carbon-negative insulation made from hemp and lime. Excellent thermal mass and breathability.',
    category: 'Insulation',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1581578731117-104f2a41232c?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    price: 55.00,
    unit: 'block',
    stock: {
      level: 'low-stock',
      quantity: 12,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: -3,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['LEED Compliant', 'Energy Star'],
    },
    rating: {
      average: 4.9,
      count: 45,
    },
    suppliers: [
      {
        id: 's9',
        name: 'BuildBase - Camden',
        address: '123 Camden High Street',
        distance: 0.8,
        phone: '020 7123 4567',
        website: 'https://buildbase.co.uk',
        stock: 12,
      },
    ],
    location: {
      latitude: 51.5412,
      longitude: -0.1468,
    },
    tags: ['hempcrete', 'carbon-negative', 'natural'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'LED Downlight Fixtures',
    description: 'Energy-efficient LED downlights with 90% energy savings compared to incandescent bulbs.',
    category: 'Electrical',
    images: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80'
    ],
    price: 18.50,
    unit: 'fixture',
    stock: {
      level: 'in-stock',
      quantity: 75,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 3,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['Energy Star'],
    },
    rating: {
      average: 4.5,
      count: 234,
    },
    suppliers: [
      {
        id: 's10',
        name: 'Screwfix - Islington',
        address: '321 Upper Street',
        distance: 1.5,
        phone: '020 7456 7890',
        website: 'https://screwfix.com',
        stock: 75,
      },
    ],
    location: {
      latitude: 51.5465,
      longitude: -0.1038,
    },
    tags: ['led', 'lighting', 'energy-efficient'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Reclaimed Oak Beams',
    description: 'Authentic reclaimed oak beams with character and history. Perfect for restoration projects.',
    category: 'Timber',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80',
      'https://images.unsplash.com/photo-1590694483197-1633e77c5767?w=800&q=80'
    ],
    price: 150.00,
    unit: 'beam',
    stock: {
      level: 'in-stock',
      quantity: 8,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 0,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['FSC Certified'],
    },
    rating: {
      average: 4.9,
      count: 34,
    },
    suppliers: [
      {
        id: 's11',
        name: 'Travis Perkins - Kings Cross',
        address: '456 York Way',
        distance: 1.2,
        phone: '020 7234 5678',
        website: 'https://travisperkins.com',
        stock: 8,
      },
    ],
    location: {
      latitude: 51.5375,
      longitude: -0.1245,
    },
    tags: ['reclaimed', 'oak', 'restoration'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'Dual-Flush Low-Flow Toilet',
    description: 'Water-efficient toilet with dual flush options. Uses 4.5/3 liters per flush.',
    category: 'Plumbing',
    images: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80'
    ],
    price: 199.99,
    unit: 'unit',
    stock: {
      level: 'in-stock',
      quantity: 18,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 35,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'B',
      certifications: ['Energy Star', 'WaterSense'],
    },
    rating: {
      average: 4.3,
      count: 112,
    },
    suppliers: [
      {
        id: 's12',
        name: 'Wickes - Angel',
        address: '556 Liverpool Road',
        distance: 2.8,
        phone: '020 7567 8901',
        website: 'https://wickes.co.uk',
        stock: 18,
      },
    ],
    location: {
      latitude: 51.5328,
      longitude: -0.1057,
    },
    tags: ['plumbing', 'water-efficient', 'toilet'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'Cork Wall Tiles',
    description: 'Natural acoustic wall tiles made from sustainable cork. Excellent sound absorption properties.',
    category: 'Drywall',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80'
    ],
    price: 42.00,
    unit: 'sq.m',
    stock: {
      level: 'out-of-stock',
      quantity: 0,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 7,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['FSC Certified', 'PEFC Certified'],
    },
    rating: {
      average: 4.6,
      count: 56,
    },
    suppliers: [
      {
        id: 's13',
        name: 'HomeBase - Holloway',
        address: '789 Holloway Road',
        distance: 2.1,
        phone: '020 7345 6789',
        website: 'https://homebase.co.uk',
        stock: 0,
      },
    ],
    location: {
      latitude: 51.5517,
      longitude: -0.1134,
    },
    tags: ['cork', 'acoustic', 'natural'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '13',
    name: 'Smart Thermostat',
    description: 'WiFi-enabled smart thermostat with learning algorithms. Reduces heating costs by up to 23%.',
    category: 'Electrical',
    images: [
      'https://images.unsplash.com/photo-1558002038-1091a1661116?w=800&q=80',
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
      'https://images.unsplash.com/photo-1558002038-1091a1661116?w=800&q=80'
    ],
    price: 249.99,
    unit: 'unit',
    stock: {
      level: 'in-stock',
      quantity: 22,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 15,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['Energy Star'],
    },
    rating: {
      average: 4.7,
      count: 289,
    },
    suppliers: [
      {
        id: 's14',
        name: 'Screwfix - Islington',
        address: '321 Upper Street',
        distance: 1.5,
        phone: '020 7456 7890',
        website: 'https://screwfix.com',
        stock: 22,
      },
    ],
    location: {
      latitude: 51.5465,
      longitude: -0.1038,
    },
    tags: ['smart', 'thermostat', 'wifi'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '14',
    name: 'Permeable Paving Blocks',
    description: 'Water-permeable concrete blocks that reduce runoff and support groundwater recharge.',
    category: 'Landscaping',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    price: 38.50,
    unit: 'sq.m',
    stock: {
      level: 'in-stock',
      quantity: 200,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 22,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'B',
      certifications: ['LEED Compliant'],
    },
    rating: {
      average: 4.4,
      count: 91,
    },
    suppliers: [
      {
        id: 's15',
        name: 'BuildBase - Camden',
        address: '123 Camden High Street',
        distance: 0.8,
        phone: '020 7123 4567',
        website: 'https://buildbase.co.uk',
        stock: 200,
      },
    ],
    location: {
      latitude: 51.5412,
      longitude: -0.1468,
    },
    tags: ['paving', 'permeable', 'landscaping'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '15',
    name: 'Triple-Glazed Windows',
    description: 'High-performance triple-glazed windows with low-E coating. Excellent insulation and noise reduction.',
    category: 'Windows',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1560535379-7a6786e17e9f?w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ],
    price: 350.00,
    unit: 'window',
    stock: {
      level: 'low-stock',
      quantity: 3,
      lastUpdated: new Date().toISOString(),
    },
    eco: {
      carbonFootprint: 85,
      carbonFootprintUnit: 'kg CO2e',
      rating: 'A',
      certifications: ['Energy Star', 'LEED Compliant'],
    },
    rating: {
      average: 4.8,
      count: 167,
    },
    suppliers: [
      {
        id: 's16',
        name: 'Travis Perkins - Kings Cross',
        address: '456 York Way',
        distance: 1.2,
        phone: '020 7234 5678',
        website: 'https://travisperkins.com',
        stock: 3,
      },
    ],
    location: {
      latitude: 51.5375,
      longitude: -0.1245,
    },
    tags: ['windows', 'triple-glazed', 'insulation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock search suggestions
export const mockSearchSuggestions = [
  { id: '1', text: 'insulation', category: 'Building Materials' },
  { id: '2', text: 'plywood', category: 'Timber' },
  { id: '3', text: 'paint', category: 'Finishes' },
  { id: '4', text: 'solar panels', category: 'Energy' },
  { id: '5', text: 'flooring', category: 'Flooring' },
  { id: '6', text: 'eco-friendly materials', category: 'Sustainable' },
  { id: '7', text: 'led lighting', category: 'Electrical' },
  { id: '8', text: 'recycled materials', category: 'Sustainable' },
];

// Mock filter facets
export const mockFacets = {
  categories: [
    { name: 'Insulation', count: 245 },
    { name: 'Timber', count: 189 },
    { name: 'Roofing', count: 156 },
    { name: 'Flooring', count: 134 },
    { name: 'Drywall', count: 98 },
    { name: 'Paints', count: 87 },
    { name: 'Electrical', count: 76 },
    { name: 'Windows', count: 65 },
    { name: 'Plumbing', count: 54 },
    { name: 'Landscaping', count: 43 },
  ],
  priceRange: { min: 0, max: 1000 },
  certifications: [
    { name: 'FSC Certified', count: 156 },
    { name: 'PEFC Certified', count: 134 },
    { name: 'Energy Star', count: 298 },
    { name: 'LEED Compliant', count: 267 },
    { name: 'ISO 14001', count: 189 },
  ],
  brands: [
    { name: 'BuildBase', count: 342 },
    { name: 'Travis Perkins', count: 298 },
    { name: 'HomeBase', count: 234 },
    { name: 'Wickes', count: 187 },
    { name: 'Screwfix', count: 156 },
  ],
};

// Search term aliases for better matching
const searchAliases: Record<string, string[]> = {
  'wood': ['timber', 'lumber', 'plywood', 'wooden', 'oak', 'pine', 'mahogany'],
  'timber': ['wood', 'lumber', 'plywood'],
  'insulation': ['insulating', 'thermal', 'insulate'],
  'floor': ['flooring', 'floors'],
  'paint': ['painting', 'coating'],
  'solar': ['solar panel', 'photovoltaic', 'pv'],
  'window': ['windows', 'glazing'],
  'door': ['doors', 'doorway'],
  'roof': ['roofing', 'roofs'],
};

// Helper function to expand search query with aliases
function expandSearchQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  const aliases = searchAliases[q] || [];

  // Also check if any alias maps to this query
  const matchingAliases: string[] = [];
  for (const [term, synonyms] of Object.entries(searchAliases)) {
    if (synonyms.some(s => q.includes(s) || s.includes(q))) {
      matchingAliases.push(term, ...synonyms);
    }
  }

  return [q, ...aliases, ...matchingAliases];
}

// Helper function to get filtered products
export function getFilteredProducts(filters: SearchFilters = {}): SearchResults {
  console.log('getFilteredProducts called with filters:', filters);
  let filtered = [...mockProducts];
  console.log('Starting with', filtered.length, 'products');

  // Filter by query
  if (filters.query) {
    const searchTerms = expandSearchQuery(filters.query);
    filtered = filtered.filter((p) => {
      const searchText = `${p.name} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
    console.log('After query filter:', filtered.length, 'products');
  }

  // Filter by categories
  if (filters.category && filters.category.length > 0) {
    console.log('Filtering by categories:', filters.category);
    filtered = filtered.filter((p) => {
      const matches = filters.category!.includes(p.category);
      console.log(`Product "${p.name}" has category "${p.category}":`, matches);
      return matches;
    });
    console.log('After category filter:', filtered.length, 'products');
  }

  // Filter by price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);
  }

  // Filter by distance
  if (filters.distance !== undefined) {
    filtered = filtered.filter((p) => {
      const nearestDistance = Math.min(...p.suppliers.map((s) => s.distance));
      return nearestDistance <= filters.distance!;
    });
  }

  // Filter by stock
  if (filters.inStock) {
    filtered = filtered.filter((p) => p.stock.level !== 'out-of-stock');
  }

  // Filter by eco rating
  if (filters.ecoRating && filters.ecoRating.length > 0) {
    filtered = filtered.filter((p) => filters.ecoRating!.includes(p.eco.rating));
  }

  // Filter by carbon footprint
  if (filters.carbonFootprint) {
    const [min, max] = filters.carbonFootprint;
    filtered = filtered.filter((p) => p.eco.carbonFootprint >= min && p.eco.carbonFootprint <= max);
  }

  // Filter by certifications
  if (filters.certifications && filters.certifications.length > 0) {
    filtered = filtered.filter((p) =>
      filters.certifications!.some((cert) => p.eco.certifications.includes(cert))
    );
  }

  // Filter by minimum rating
  if (filters.minRating) {
    filtered = filtered.filter((p) => p.rating.average >= filters.minRating!);
  }

  // Sort results
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'distance':
        filtered.sort((a, b) => {
          const aDistance = Math.min(...a.suppliers.map((s) => s.distance));
          const bDistance = Math.min(...b.suppliers.map((s) => s.distance));
          return aDistance - bDistance;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'carbon':
        filtered.sort((a, b) => a.eco.carbonFootprint - b.eco.carbonFootprint);
        break;
      default:
        // relevance - keep default order
        break;
    }
  }

  return {
    products: filtered,
    total: filtered.length,
    page: 1,
    pageSize: filtered.length,
    facets: mockFacets,
  };
}

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

// Helper function to get search suggestions
export function getSearchSuggestions(query: string): typeof mockSearchSuggestions {
  if (!query) return [];
  const q = query.toLowerCase();
  return mockSearchSuggestions.filter(
    (s) => s.text.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );
}
