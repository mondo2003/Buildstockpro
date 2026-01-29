'use client';

import { useState } from 'react';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, Calendar, MapPin, Phone, Mail, CheckCircle, Clock, Truck, Users } from 'lucide-react';
import Link from 'next/link';

// Mock orders - in real app, these would be fetched from the API
const mockOrders: Order[] = [
  {
    id: 'ORD-123456',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: '2x4 Lumber - 8ft',
        quantity: 50,
        unitPrice: 12.99,
        totalPrice: 649.50,
      },
    ],
    supplier: {
      id: 'supp-1',
      name: 'BuildMart Supply Co.',
      address: '123 Construction Ave, San Francisco, CA 94102',
      distance: 3.2,
      phone: '+1 (555) 123-4567',
      stock: 500,
    },
    status: 'confirmed',
    fulfillmentType: 'pickup',
    subtotal: 649.50,
    fee: 0,
    total: 649.50,
    customerDetails: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 987-6543',
      company: 'Doe Construction',
    },
    estimatedPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    if (filter === 'completed') return order.status === 'completed';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'preparing':
        return <Clock className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active ({orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed ({orders.filter((o) => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `No ${filter} orders found`}
            </p>
            <Link href="/">
              <Button>Browse Materials</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">{order.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Items */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplier & Fulfillment */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Supplier & Fulfillment</h4>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">{order.supplier.name}</p>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{order.supplier.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {order.fulfillmentType === 'pickup' ? (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            <span>Pickup</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-4 h-4 mr-2" />
                            <span>Delivery</span>
                          </>
                        )}
                      </div>
                      {order.estimatedPickupTime && order.fulfillmentType === 'pickup' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Ready: {formatDate(order.estimatedPickupTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{order.customerDetails.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{order.customerDetails.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/checkout?orderId=${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {order.supplier.phone && (
                    <a href={`tel:${order.supplier.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Contact Supplier
                      </Button>
                    </a>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
