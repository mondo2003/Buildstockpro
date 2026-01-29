/**
 * Image utility functions for product images
 */

import { Product } from '@/lib/types';

/**
 * Get the primary image for a product
 * Falls back to placeholder if no images available
 */
export function getProductPrimaryImage(product: Product): string | null {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return null;
}

/**
 * Generate a placeholder image URL for a product
 */
export function generatePlaceholderImage(productName: string, width: number = 800, height: number = 600): string {
  return `https://placehold.co/${width}x${height}/e2e8f0/64748b?text=${encodeURIComponent(productName)}`;
}

/**
 * Get all product images or placeholder
 */
export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return [generatePlaceholderImage(product.name)];
}

/**
 * Check if product has valid images
 */
export function productHasImages(product: Product): boolean {
  return product.images && product.images.length > 0;
}

/**
 * Get image count badge text
 */
export function getImageCountBadge(product: Product): string | null {
  if (product.images && product.images.length > 1) {
    return `${product.images.length} photos`;
  }
  return null;
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(imageUrl: string, productName: string, index: number = 0) {
  return {
    src: imageUrl,
    alt: `${productName} ${index > 0 ? `- Image ${index + 1}` : ''}`,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
}
