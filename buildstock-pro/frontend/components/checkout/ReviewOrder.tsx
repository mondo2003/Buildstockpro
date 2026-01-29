import { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';

interface ReviewOrderProps {
  items: CartItem[];
  onNext: () => void;
}

export default function ReviewOrder({ items, onNext }: ReviewOrderProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Review Your Items</h2>
        <p className="text-gray-600 mt-1">Confirm your materials before proceeding</p>
      </div>

      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in cart</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.product.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-lg font-semibold text-green-600">
                      ${item.product.price.toFixed(2)}
                      <span className="text-sm font-normal text-gray-600">/{item.product.unit}</span>
                    </span>
                    <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.product.stock.level === 'in-stock' ? 'bg-green-100 text-green-800' :
                      item.product.stock.level === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.product.stock.level === 'in-stock' ? 'In Stock' :
                       item.product.stock.level === 'low-stock' ? 'Low Stock' :
                       'Out of Stock'}
                    </span>
                    {item.product.eco.rating && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.product.eco.rating === 'A' ? 'bg-green-100 text-green-800' :
                        item.product.eco.rating === 'B' ? 'bg-green-50 text-green-700' :
                        item.product.eco.rating === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        item.product.eco.rating === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Eco Rating: {item.product.eco.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Supplier Fee</span>
                  <span className="font-medium text-gray-400">To be calculated</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery/Pickup</span>
                  <span className="font-medium text-gray-400">To be calculated</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Estimated Total</span>
                  <span>${subtotal.toFixed(2)}+</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Final pricing will be calculated after selecting your preferred supplier
              </p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {items.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={onNext}>
              Continue to Supplier Selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
