import { useState } from 'react';
import { CartItem, Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Package, Truck, Users } from 'lucide-react';

interface SelectSupplierProps {
  items: CartItem[];
  selectedSupplier: string | null;
  onSupplierSelect: (supplierId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SelectSupplier({
  items,
  selectedSupplier,
  onSupplierSelect,
  onNext,
  onBack,
}: SelectSupplierProps) {
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');

  // Get all unique suppliers from cart items
  const allSuppliers = items.reduce((acc, item) => {
    item.product.suppliers.forEach((supplier) => {
      if (!acc.find((s) => s.id === supplier.id)) {
        acc.push(supplier);
      }
    });
    return acc;
  }, [] as Supplier[]);

  // Sort by distance
  const sortedSuppliers = allSuppliers.sort((a, b) => a.distance - b.distance);

  const selectedSupplierData = sortedSuppliers.find((s) => s.id === selectedSupplier);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 15 : 0;
  const supplierFee = 0; // Could be added later
  const total = subtotal + deliveryFee + supplierFee;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Select Your Supplier</h2>
        <p className="text-gray-600 mt-1">Choose where to pick up your materials or request delivery</p>
      </div>

      <div className="p-6">
        {/* Fulfillment Type */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How would you like to receive your order?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setFulfillmentType('pickup')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                fulfillmentType === 'pickup'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${fulfillmentType === 'pickup' ? 'bg-green-600' : 'bg-gray-100'}`}>
                  <Users className={`w-6 h-6 ${fulfillmentType === 'pickup' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900">Pick Up</h4>
                  <p className="text-sm text-gray-600 mt-1">Pick up your order at the supplier location</p>
                  <p className="text-sm font-medium text-green-600 mt-2">Free</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFulfillmentType('delivery')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                fulfillmentType === 'delivery'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${fulfillmentType === 'delivery' ? 'bg-green-600' : 'bg-gray-100'}`}>
                  <Truck className={`w-6 h-6 ${fulfillmentType === 'delivery' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900">Delivery</h4>
                  <p className="text-sm text-gray-600 mt-1">Have it delivered to your location</p>
                  <p className="text-sm font-medium text-green-600 mt-2">${deliveryFee.toFixed(2)}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Supplier List */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Suppliers</h3>
          <div className="space-y-4">
            {sortedSuppliers.map((supplier) => (
              <button
                key={supplier.id}
                onClick={() => onSupplierSelect(supplier.id)}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedSupplier === supplier.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-lg font-semibold text-gray-900">{supplier.name}</h4>
                      {supplier.distance < 5 && (
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Nearby
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {supplier.address}
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {supplier.stock} items in stock
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className="text-sm font-medium text-gray-900">Distance: </span>
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        {supplier.distance.toFixed(1)} miles
                      </span>
                    </div>
                  </div>

                  {selectedSupplier === supplier.id && (
                    <div className="ml-4">
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {selectedSupplierData && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fulfillment</span>
                <span className="font-medium capitalize">
                  {fulfillmentType === 'pickup' ? 'Pick Up (Free)' : `Delivery ($${deliveryFee.toFixed(2)})`}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              This is a reservation. No payment will be charged at this time.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Review
          </Button>
          <Button size="lg" onClick={onNext} disabled={!selectedSupplier}>
            Continue to Details
          </Button>
        </div>
      </div>
    </div>
  );
}
