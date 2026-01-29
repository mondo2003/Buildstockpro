import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Phone, MapPin, Clock, Package, Truck, Users, Download } from 'lucide-react';
import Link from 'next/link';

interface ConfirmationProps {
  order: Order;
}

export default function Confirmation({ order }: ConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h2>
        <p className="text-gray-600 text-lg mb-4">
          Your order <span className="font-semibold text-gray-900">{order.id}</span> has been placed successfully
        </p>
        <p className="text-gray-500">A confirmation email has been sent to {order.customerDetails.email}</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Items</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Supplier</h4>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{order.supplier.name}</p>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{order.supplier.address}</span>
                </div>
                {order.supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{order.supplier.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.fee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium">${order.fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Details */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Fulfillment Details</h3>
        </div>

        <div className="p-6">
          <div className={`flex items-start p-4 rounded-lg ${
            order.fulfillmentType === 'pickup' ? 'bg-blue-50' : 'bg-purple-50'
          }`}>
            <div className={`p-3 rounded-lg ${
              order.fulfillmentType === 'pickup' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {order.fulfillmentType === 'pickup' ? (
                <Users className="w-6 h-6 text-white" />
              ) : (
                <Truck className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <h4 className="font-semibold text-gray-900">
                {order.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}
              </h4>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {order.fulfillmentType === 'pickup' ? (
                    <span>
                      Ready for pickup: <strong>{order.estimatedPickupTime ? formatDate(order.estimatedPickupTime) : 'TBD'}</strong>
                    </span>
                  ) : (
                    <span>
                      Estimated delivery: <strong>{order.estimatedDeliveryTime ? formatDate(order.estimatedDeliveryTime) : 'TBD'}</strong>
                    </span>
                  )}
                </div>
                {order.fulfillmentType === 'pickup' && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{order.supplier.address}</span>
                  </div>
                )}
                {order.fulfillmentType === 'delivery' && order.customerDetails.deliveryAddress && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {order.customerDetails.deliveryAddress.street}<br />
                      {order.customerDetails.deliveryAddress.city}, {order.customerDetails.deliveryAddress.state} {order.customerDetails.deliveryAddress.zipCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.customerDetails.deliveryAddress?.instructions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Delivery Instructions:</p>
              <p className="text-sm text-gray-600">{order.customerDetails.deliveryAddress.instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{order.customerDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900">{order.customerDetails.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="font-medium text-gray-900">{order.customerDetails.phone}</p>
                </div>
              </div>
              {order.customerDetails.company && (
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="font-medium text-gray-900">{order.customerDetails.company}</p>
                  </div>
                </div>
              )}
            </div>

            {order.customerDetails.notes && (
              <div>
                <p className="text-sm text-gray-500">Additional Notes</p>
                <p className="text-gray-700 mt-1">{order.customerDetails.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Order Status</h3>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="text-lg font-semibold text-green-600 capitalize mt-1">{order.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Placed</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {['confirmed', 'preparing', 'ready', 'completed'].map((status, index) => {
                  const isCompleted = ['confirmed', 'preparing', 'ready', 'completed'].indexOf(order.status) >= index;
                  const isCurrent = order.status === status;

                  return (
                    <div key={status} className="relative flex items-start">
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-green-600' : 'bg-gray-400'}`} />
                        )}
                      </div>
                      <div className="ml-12">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {status === 'confirmed' && 'Order Confirmed'}
                          {status === 'preparing' && 'Preparing'}
                          {status === 'ready' && order.fulfillmentType === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery'}
                          {status === 'completed' && 'Completed'}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>You'll receive a confirmation email with all the order details</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              {order.fulfillmentType === 'pickup'
                ? `We'll notify you when your order is ready for pickup`
                : `The supplier will contact you to schedule delivery`}
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>You can track your order status in your profile</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Payment will be collected upon {order.fulfillmentType === 'pickup' ? 'pickup' : 'delivery'}</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button size="lg" variant="outline">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/profile/orders">
          <Button size="lg">
            View Order History
          </Button>
        </Link>
      </div>
    </div>
  );
}
