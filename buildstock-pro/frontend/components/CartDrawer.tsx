'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Leaf,
  MapPin,
  ArrowRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    shippingEstimate,
    total,
  } = useCart();

  const handleCheckout = () => {
    // Close drawer before navigating
    closeCart();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCart}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-primary/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6 max-w-xs">
                  Start adding sustainable building materials to your cart
                </p>
                <Button asChild onClick={closeCart}>
                  <Link href="/search">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const supplier = item.product.suppliers.find(
                    (s) => s.id === item.supplierId
                  );

                  return (
                    <div
                      key={`${item.product.id}-${item.supplierId}`}
                      className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                          <Package className="w-10 h-10 text-primary/30" />
                          {item.product.eco.certifications.length > 0 && (
                            <Badge className="absolute top-1 right-1 bg-accent/90 hover:bg-accent text-white border-0 shadow-md text-xs px-1.5 py-0">
                              <Leaf className="w-2.5 h-2.5" />
                            </Badge>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product.id}`}
                            onClick={closeCart}
                            className="block"
                          >
                            <h4 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                              {item.product.name}
                            </h4>
                          </Link>

                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{supplier?.name}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-gray-100"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.supplierId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-gray-100"
                                onClick={() =>
                                  updateQuantity(
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

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                £{(item.product.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                £{item.product.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.product.stock.quantity && (
                            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                              <span>⚠️</span>
                              <span>Max stock reached</span>
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product.id, item.supplierId)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {items.length > 0 && (
            <div className="border-t bg-gradient-to-b from-gray-50 to-white p-6 space-y-4">
              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span className="font-medium">£{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingEstimate === 0 ? (
                    <span className="font-medium text-accent">FREE</span>
                  ) : (
                    <span className="font-medium">£{shippingEstimate.toFixed(2)}</span>
                  )}
                </div>

                {shippingEstimate > 0 && (
                  <p className="text-xs text-accent">
                    🎉 Free shipping on orders over £500
                  </p>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Carbon Savings */}
              {items.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-accent" />
                    <span className="font-medium text-accent">Eco-friendly choice!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're supporting sustainable suppliers
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                onClick={handleCheckout}
              >
                <Link href="/cart" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
