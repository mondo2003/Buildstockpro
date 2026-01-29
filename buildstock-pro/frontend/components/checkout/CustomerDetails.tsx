import { useState } from 'react';
import { CartItem, CheckoutFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building, FileText, User } from 'lucide-react';

interface CustomerDetailsProps {
  items: CartItem[];
  selectedSupplier: string | null;
  onSubmit: (data: CheckoutFormData) => void;
  onBack: () => void;
}

export default function CustomerDetails({ items, selectedSupplier, onSubmit, onBack }: CustomerDetailsProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    fulfillmentType: 'pickup',
    deliveryAddress: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (formData.fulfillmentType === 'delivery') {
      if (!formData.deliveryAddress?.street?.trim()) {
        (newErrors as any).street = 'Street address is required';
      }
      if (!formData.deliveryAddress?.city?.trim()) {
        (newErrors as any).city = 'City is required';
      }
      if (!formData.deliveryAddress?.state?.trim()) {
        (newErrors as any).state = 'State is required';
      }
      if (!formData.deliveryAddress?.zipCode?.trim()) {
        (newErrors as any).zipCode = 'ZIP code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDeliveryAddressChange = (field: keyof NonNullable<CheckoutFormData['deliveryAddress']>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: '',
        ...prev.deliveryAddress,
        [field]: value,
      },
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = formData.fulfillmentType === 'delivery' ? 15 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Your Details</h2>
        <p className="text-gray-600 mt-1">Please provide your contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Your Company"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Any special instructions or requests..."
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formData.fulfillmentType === 'pickup' ? 'Pickup Information' : 'Delivery Address'}
              </h3>

              {formData.fulfillmentType === 'delivery' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={formData.deliveryAddress?.street || ''}
                      onChange={(e) => handleDeliveryAddressChange('street', e.target.value)}
                      className={`block w-full px-3 py-2 border ${
                        (errors as any).street ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="123 Main St"
                    />
                    {(errors as any).street && <p className="mt-1 text-sm text-red-600">{(errors as any).street}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.deliveryAddress?.city || ''}
                        onChange={(e) => handleDeliveryAddressChange('city', e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          (errors as any).city ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="San Francisco"
                      />
                      {(errors as any).city && <p className="mt-1 text-sm text-red-600">{(errors as any).city}</p>}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={formData.deliveryAddress?.state || ''}
                        onChange={(e) => handleDeliveryAddressChange('state', e.target.value)}
                        className={`block w-full px-3 py-2 border ${
                          (errors as any).state ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="CA"
                      />
                      {(errors as any).state && <p className="mt-1 text-sm text-red-600">{(errors as any).state}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      value={formData.deliveryAddress?.zipCode || ''}
                      onChange={(e) => handleDeliveryAddressChange('zipCode', e.target.value)}
                      className={`block w-full px-3 py-2 border ${
                        (errors as any).zipCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder="94102"
                    />
                    {(errors as any).zipCode && <p className="mt-1 text-sm text-red-600">{(errors as any).zipCode}</p>}
                  </div>

                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="instructions"
                      rows={2}
                      value={formData.deliveryAddress?.instructions || ''}
                      onChange={(e) => handleDeliveryAddressChange('instructions', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Gate code, building instructions, etc."
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pickup Location:</strong> You'll receive pickup instructions and the supplier's address in your order confirmation.
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Fulfillment</span>
                  <span className="font-medium capitalize">
                    {formData.fulfillmentType === 'pickup' ? 'Pick Up (Free)' : `Delivery ($${deliveryFee.toFixed(2)})`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to Supplier
          </Button>
          <Button type="submit" size="lg">
            Complete Reservation
          </Button>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          By completing this reservation, you agree to our terms and conditions. No payment will be charged at this time.
        </p>
      </form>
    </div>
  );
}
