'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Leaf, Package, ShoppingCart, ExternalLink, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  showSupplier?: boolean;
  onReserve?: (productId: string, supplierId: string) => void;
}

export function ProductCard({
  product,
  variant = 'default',
  showSupplier = true,
  onReserve,
}: ProductCardProps) {
  const [isReserving, setIsReserving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  // Get current image or fallback to placeholder
  const currentImage = product.images && product.images.length > 0 && !imageError
    ? product.images[currentImageIndex % product.images.length]
    : null;

  // Generate placeholder image with product name
  const placeholderImage = `https://placehold.co/800x600/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;

  const handleImageError = () => {
    setImageError(true);
  };

  // Find nearest supplier
  const nearestSupplier = product.suppliers.sort((a, b) => a.distance - b.distance)[0];
  const cheapestSupplier = product.suppliers.sort((a, b) => a.stock - b.stock)[0];

  const handleReserve = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nearestSupplier || product.stock.level === 'out-of-stock') return;

    setIsReserving(true);
    try {
      // Add to cart using context
      addItem(product, nearestSupplier.id, 1);

      // Show success feedback
      setAddedToCart(true);

      // Show toast notification
      toast.success('Added to cart', {
        description: `${product.name} has been added to your cart`,
        duration: 2000,
      });

      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);

      // Call original onReserve if provided
      if (onReserve) {
        await onReserve(product.id, nearestSupplier.id);
      }
    } finally {
      setIsReserving(false);
    }
  };

  const getStockBadgeColor = (level: string) => {
    switch (level) {
      case 'in-stock':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'low-stock':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'out-of-stock':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStockStatusText = (level: string) => {
    switch (level) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground/30" />
        ))}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <Link href={`/product/${product.id}`}>
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    loading="lazy"
                    onError={handleImageError}
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-10 h-10 text-primary/30 transition-transform group-hover:scale-110" />
                  </div>
                )}
                {product.eco.certifications.length > 0 && (
                  <Badge className="absolute top-1 right-1 bg-accent/90 hover:bg-accent text-white border-0 shadow-md text-xs px-1.5 py-0 z-10">
                    <Leaf className="w-2.5 h-2.5" />
                  </Badge>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  {renderStars(product.rating.average)}
                  <span className="text-xs text-muted-foreground">
                    ({product.rating.count})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">£{product.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per {product.unit}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStockBadgeColor(product.stock.level))}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full bg-current mr-1.5',
                        product.stock.level === 'in-stock' && 'animate-pulse'
                      )}
                    />
                    {getStockStatusText(product.stock.level)}
                  </Badge>
                </div>

                {showSupplier && nearestSupplier && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{nearestSupplier.name}</span>
                    <span>• {nearestSupplier.distance.toFixed(1)} mi</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          {currentImage ? (
            <>
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1"
                loading="lazy"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Image counter badge if multiple images */}
              {product.images && product.images.length > 1 && (
                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 bg-black/60 text-white border-0 text-xs"
                >
                  {product.images.length} photos
                </Badge>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-20 h-20 text-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            </div>
          )}
          {product.eco.certifications.length > 0 && (
            <Badge className="absolute top-3 right-3 bg-accent/90 hover:bg-accent text-white border-0 shadow-md z-10">
              <Leaf className="w-3 h-3 mr-1" />
              Eco
            </Badge>
          )}
          {product.stock.level === 'out-of-stock' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <Badge variant="destructive" className="text-sm px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3 flex-1">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>

          {/* Category Badge */}
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Rating & Carbon Footprint */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderStars(product.rating.average)}
              <span className="text-sm font-medium">{product.rating.average}</span>
              <span className="text-xs text-muted-foreground">
                ({product.rating.count})
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                product.eco.rating === 'A' && 'border-accent/50 text-accent',
                product.eco.rating === 'B' && 'border-green-500/50 text-green-500',
                product.eco.rating === 'C' && 'border-yellow-500/50 text-yellow-500',
                product.eco.rating === 'D' && 'border-orange-500/50 text-orange-500',
                product.eco.rating === 'E' && 'border-red-500/50 text-red-500'
              )}
            >
              {product.eco.carbonFootprint > 0 ? '+' : ''}
              {product.eco.carbonFootprint}
              {product.eco.carbonFootprintUnit}
            </Badge>
          </div>

          {/* Supplier Info */}
          {showSupplier && nearestSupplier && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{nearestSupplier.name}</p>
                <p className="text-xs text-muted-foreground">
                  {nearestSupplier.distance.toFixed(1)} miles away
                  {nearestSupplier.stock > 0 && ` • ${nearestSupplier.stock} in stock`}
                </p>
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              product.stock.level === 'in-stock' && 'text-accent',
              product.stock.level === 'low-stock' && 'text-orange-500',
              product.stock.level === 'out-of-stock' && 'text-destructive'
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full bg-current',
                product.stock.level === 'in-stock' && 'animate-pulse'
              )}
            />
            <span className="capitalize">{getStockStatusText(product.stock.level)}</span>
            {product.stock.quantity > 0 && (
              <span className="text-muted-foreground font-normal">
                ({product.stock.quantity} available)
              </span>
            )}
          </div>

          {/* Eco Certifications */}
          {product.eco.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.eco.certifications.slice(0, 2).map((cert) => (
                <Badge key={cert} variant="secondary" className="text-xs">
                  {cert}
                </Badge>
              ))}
              {product.eco.certifications.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.eco.certifications.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-2xl font-bold">£{product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per {product.unit}</p>
            </div>

            {product.stock.level === 'out-of-stock' ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                Unavailable
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleReserve}
                disabled={isReserving}
                className={cn(
                  'shadow-md hover:shadow-lg transition-shadow group/btn',
                  addedToCart && 'bg-accent hover:bg-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  {isReserving ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Adding...
                    </>
                  ) : addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      Add to Cart
                    </>
                  )}
                </div>
              </Button>
            )}
          </div>
        </CardFooter>

        {/* Hover overlay for "View Details" */}
        <div className="absolute inset-0 bg-primary/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <Button
            variant="secondary"
            size="lg"
            className="pointer-events-auto shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </Card>
    </Link>
  );
}
