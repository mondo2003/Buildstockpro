'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CartItem, CheckoutFormData, Order } from '@/lib/types';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import ReviewOrder from '@/components/checkout/ReviewOrder';
import SelectSupplier from '@/components/checkout/SelectSupplier';
import CustomerDetails from '@/components/checkout/CustomerDetails';
import Confirmation from '@/components/checkout/Confirmation';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type CheckoutStep = 'review' | 'supplier' | 'details' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);

  // Mock data - in real app, this would come from cart context/API
  const mockCartItems: CartItem[] = [];

  const getStepStatus = (step: CheckoutStep): 'current' | 'complete' | 'upcoming' => {
    if (currentStep === step) return 'current';
    const stepOrder: CheckoutStep[] = ['review', 'supplier', 'details', 'confirmation'];
    return stepOrder.indexOf(currentStep) > stepOrder.indexOf(step) ? 'complete' : 'upcoming';
  };

  const steps = [
    { id: 'review', label: 'Review Order', status: getStepStatus('review') },
    { id: 'supplier', label: 'Select Supplier', status: getStepStatus('supplier') },
    { id: 'details', label: 'Your Details', status: getStepStatus('details') },
    { id: 'confirmation', label: 'Confirmation', status: getStepStatus('confirmation') },
  ];

  const handleNext = () => {
    if (currentStep === 'review') {
      setCurrentStep('supplier');
    } else if (currentStep === 'supplier') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      // Submit order
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'supplier') {
      setCurrentStep('review');
    } else if (currentStep === 'details') {
      setCurrentStep('supplier');
    } else if (currentStep === 'confirmation') {
      router.push('/');
    }
  };

  const handleSubmitOrder = async (formData: CheckoutFormData) => {
    // Calculate totals
    const subtotal = mockCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const fee = formData.fulfillmentType === 'delivery' ? 15 : 0;
    const total = subtotal + fee;

    // Create order
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: 'mock-user-id',
      items: mockCartItems.map(item => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
      })),
      supplier: mockCartItems[0]?.product.suppliers.find(s => s.id === selectedSupplier) || mockCartItems[0]?.product.suppliers[0],
      status: 'confirmed',
      fulfillmentType: formData.fulfillmentType,
      subtotal,
      fee,
      total,
      customerDetails: formData,
      estimatedPickupTime: formData.fulfillmentType === 'pickup' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : undefined,
      estimatedDeliveryTime: formData.fulfillmentType === 'delivery' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrderData(order);

    // In real app, save to database via API
    // await api.createOrder(order);

    setCurrentStep('confirmation');
  };

  // If cart is empty, show empty state
  if (mockCartItems.length === 0 && currentStep === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some materials to get started with your reservation.</p>
            <Link href="/">
              <Button size="lg">Browse Materials</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Reservation</h1>
          <p className="text-gray-600 mt-1">Follow the steps to reserve your materials</p>
        </div>

        {/* Progress Steps */}
        <CheckoutSteps steps={steps} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 'review' && (
            <ReviewOrder
              items={mockCartItems}
              onNext={handleNext}
            />
          )}

          {currentStep === 'supplier' && (
            <SelectSupplier
              items={mockCartItems}
              selectedSupplier={selectedSupplier}
              onSupplierSelect={setSelectedSupplier}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'details' && (
            <CustomerDetails
              items={mockCartItems}
              selectedSupplier={selectedSupplier}
              onSubmit={handleSubmitOrder}
              onBack={handleBack}
            />
          )}

          {currentStep === 'confirmation' && orderData && (
            <Confirmation order={orderData} />
          )}
        </div>
      </div>
    </div>
  );
}
