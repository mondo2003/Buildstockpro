'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Leaf,
  MapPin,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    shippingEstimate,
    total,
  } = useCart();

  const handleQuantityChange = (
    productId: string,
    supplierId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      removeItem(productId, supplierId);
    } else {
      updateQuantity(productId, supplierId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-primary/30" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Start adding sustainable building materials to your cart and see them appear here
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/search">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const supplier = item.product.suppliers.find(
                (s) => s.id === item.supplierId
              );

              return (
                <Card
                  key={`${item.product.id}-${item.supplierId}`}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      {item.product.eco.certifications.length > 0 && (
                        <Badge className="absolute top-2 right-2 bg-accent/90 hover:bg-accent text-white border-0 shadow-md">
                          <Leaf className="w-3 h-3 mr-1" />
                          Eco
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            href={`/product/${item.product.id}`}
                            className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.product.description}
                          </p>
                        </div>
                      </div>

                      {/* Supplier Info */}
                      {supplier && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{supplier.name}</span>
                          <span>•</span>
                          <span>{supplier.distance.toFixed(1)} miles away</span>
                        </div>
                      )}

                      {/* Eco Rating */}
                      <div className="mb-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            item.product.eco.rating === 'A' && 'border-accent/50 text-accent',
                            item.product.eco.rating === 'B' && 'border-green-500/50 text-green-500',
                            item.product.eco.rating === 'C' && 'border-yellow-500/50 text-yellow-500',
                            item.product.eco.rating === 'D' && 'border-orange-500/50 text-orange-500',
                            item.product.eco.rating === 'E' && 'border-red-500/50 text-red-500'
                          )}
                        >
                          Eco Rating: {item.product.eco.rating}
                        </Badge>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.supplierId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.supplierId,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.product.stock.quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.product.stock.quantity && (
                            <p className="text-xs text-orange-500">
                              Max stock reached
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            £{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            £{item.product.price.toFixed(2)} per {item.product.unit}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id, item.supplierId)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6 bg-gradient-to-b from-white to-gray-50">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span className="font-medium">£{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Shipping</span>
                    <Truck className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {shippingEstimate === 0 ? (
                    <span className="font-medium text-accent">FREE</span>
                  ) : (
                    <span className="font-medium">£{shippingEstimate.toFixed(2)}</span>
                  )}
                </div>

                {shippingEstimate > 0 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <p className="text-sm text-accent font-medium">
                      🎉 Free shipping on orders over £500
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add £{(500 - subtotal).toFixed(2)} more to qualify
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Environmental Impact */}
              {items.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-accent">Eco-friendly choice!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're supporting {items.length} sustainable product(s) from verified
                    green suppliers
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all mb-3"
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Proceed to Checkout
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/search" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Fast Delivery</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Eco-Friendly</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Secure Payment</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
