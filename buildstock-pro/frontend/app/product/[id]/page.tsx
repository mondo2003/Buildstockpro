import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Leaf } from 'lucide-react';
import { Product } from '@/lib/types';
import { getProductById } from '@/lib/mockData';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { ContactMerchantButton } from '@/components/merchant-contact';

// This would normally fetch from the API
async function getProduct(id: string): Promise<Product | null> {
  // Try to get from mock data
  const mockProduct = getProductById(id);
  if (mockProduct) {
    return mockProduct;
  }

  // Fallback to mock product for 'mock' id
  if (id !== 'mock') return null;

  return {
    id: 'mock',
    name: 'Recycled Insulation Roll',
    description: 'High-performance thermal insulation made from 80% recycled glass. Significantly reduces heat loss.',
    category: 'Insulation',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1581578731117-104f2a41232c?w=800&q=80',
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
        stock: 42,
      },
    ],
    location: {
      latitude: 51.5412,
      longitude: -0.1468,
    },
    tags: ['insulation', 'eco-friendly', 'thermal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            <span className="mx-2">/</span>
            <a href="/search" className="hover:text-primary">Search</a>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.description}</p>
              </div>
              {product.eco.certifications.length > 0 && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Leaf className="w-4 h-4 mr-1" />
                  Eco-Friendly
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.rating.average} ({product.rating.count} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image Gallery */}
            <ProductImageGallery images={product.images} productName={product.name} />

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Price & Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">
                      £{product.price.toFixed(2)}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{product.unit}
                      </span>
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 ${
                    product.stock.level === 'in-stock' ? 'text-accent' :
                    product.stock.level === 'low-stock' ? 'text-orange-500' :
                    'text-destructive'
                  }`}>
                    <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
                    <span className="font-medium capitalize">
                      {product.stock.level === 'in-stock' && `${product.stock.quantity} in stock`}
                      {product.stock.level === 'low-stock' && `Low stock (${product.stock.quantity} left)`}
                      {product.stock.level === 'out-of-stock' && 'Out of stock'}
                    </span>
                  </div>

                  <Button className="w-full" size="lg" disabled={product.stock.level === 'out-of-stock'}>
                    {product.stock.level === 'out-of-stock' ? 'Out of Stock' : 'Reserve for Pickup'}
                  </Button>

                  {/* Contact Merchant Button */}
                  {product.suppliers[0] && (
                    <ContactMerchantButton
                      merchantId={product.suppliers[0].id}
                      merchantName={product.suppliers[0].name}
                      productId={product.id}
                      productName={product.name}
                      buttonLabel="Contact Merchant about this Product"
                      variant="outline"
                      className="w-full"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Environmental Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-accent" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Carbon Footprint</p>
                    <p className="text-2xl font-bold">
                      {product.eco.carbonFootprint}{product.eco.carbonFootprintUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Eco Rating</p>
                    <Badge
                      variant="outline"
                      className={`text-lg px-4 py-1 ${
                        product.eco.rating === 'A' ? 'bg-accent/10 text-accent border-accent/20' :
                        product.eco.rating === 'B' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        product.eco.rating === 'C' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}
                    >
                      {product.eco.rating}
                    </Badge>
                  </div>

                  {product.eco.certifications.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {product.eco.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nearby Suppliers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Nearby Suppliers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.suppliers.slice(0, 3).map((supplier) => (
                      <div key={supplier.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{supplier.name}</h4>
                            <p className="text-sm text-muted-foreground">{supplier.address}</p>
                          </div>
                          <Badge variant="outline">
                            {supplier.distance.toFixed(1)} miles
                          </Badge>
                        </div>
                        <p className="text-sm">
                          <span className={`font-medium ${
                            supplier.stock > 10 ? 'text-accent' :
                            supplier.stock > 0 ? 'text-orange-500' :
                            'text-destructive'
                          }`}>
                            {supplier.stock > 0 ? `${supplier.stock} in stock` : 'Out of stock'}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
