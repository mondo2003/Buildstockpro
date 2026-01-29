# Checkout Flow Documentation

## Overview

The BuildStop checkout flow is a multi-step wizard that guides users through the reservation process for construction materials. The system is designed to be reassuring and user-friendly, with clear visual feedback at each step.

## Features

### Multi-Step Checkout Process

1. **Review Order** - Users review items in their cart before proceeding
2. **Select Supplier** - Choose a supplier based on distance and availability
3. **Customer Details** - Enter contact information and delivery preferences
4. **Confirmation** - Receive order confirmation with details and next steps

### Key Capabilities

- **Pickup or Delivery**: Users can choose between picking up materials or having them delivered
- **Supplier Selection**: View suppliers sorted by distance with real-time availability
- **Form Validation**: Client-side validation with clear error messages
- **Order Confirmation**: Detailed confirmation page with order tracking
- **Order History**: View all past orders with status tracking
- **Notifications**: Real-time order status updates via browser notifications

## File Structure

```
frontend/
├── app/
│   ├── checkout/
│   │   └── page.tsx                    # Main checkout page
│   └── profile/
│       └── orders/
│           └── page.tsx                # Order history page
├── components/
│   ├── checkout/
│   │   ├── CheckoutSteps.tsx           # Progress indicator
│   │   ├── ReviewOrder.tsx             # Step 1: Review cart
│   │   ├── SelectSupplier.tsx          # Step 2: Choose supplier
│   │   ├── CustomerDetails.tsx         # Step 3: Enter details
│   │   └── Confirmation.tsx            # Step 4: Order confirmation
│   └── NotificationCenter.tsx          # Notification bell component
├── lib/
│   ├── types.ts                        # TypeScript types (Cart, Order)
│   ├── api.ts                          # API client with order methods
│   ├── notifications.ts                # Notification service
│   └── checkout-utils.ts               # Utility functions
```

## Data Models

### CartItem
```typescript
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  supplierId: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  supplier: Supplier;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  fulfillmentType: 'pickup' | 'delivery';
  subtotal: number;
  fee: number;
  total: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    notes?: string;
    deliveryAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      instructions?: string;
    };
  };
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Usage

### Starting Checkout

Navigate to `/checkout` to begin the checkout process. The page will:

1. Check if the cart has items
2. Display empty state if cart is empty
3. Show the first step (Review Order) if cart has items

### Creating an Order

```typescript
import { api } from '@/lib/api';

const checkoutData = {
  items: cartItems,
  supplierId: selectedSupplier,
  fulfillmentType: 'pickup',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
};

const order = await api.createOrder(checkoutData);
console.log(order.id); // 'ORD-123456'
```

### Viewing Order History

Navigate to `/profile/orders` to see all orders with filtering options:

- **All Orders** - Show all orders
- **Active** - Show pending, confirmed, preparing, and ready orders
- **Completed** - Show only completed orders

### Order Notifications

The notification service provides real-time updates:

```typescript
import { notificationService } from '@/lib/notifications';

// Subscribe to notifications
const unsubscribe = notificationService.subscribe((notification) => {
  console.log('New notification:', notification.title);
});

// Manually trigger a status change
notificationService.notifyStatusChange('ORD-123456', 'confirmed');
```

## API Endpoints

### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "items": [...],
  "supplierId": "supplier-123",
  "fulfillmentType": "pickup",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "company": "Doe Construction",
  "notes": "Please call upon arrival"
}
```

### Get User Orders
```
GET /api/orders
```

### Get Single Order
```
GET /api/orders/:orderId
```

### Cancel Order
```
POST /api/orders/:orderId/cancel
```

## Testing

### Mock Data

Use the utility functions to test the checkout flow:

```typescript
import { createMockCartItems } from '@/lib/checkout-utils';
import { mockProducts } from '@/lib/mockData';

// Create mock cart items
const cartItems = createMockCartItems(mockProducts);
```

### Manual Testing

1. Add items to cart (requires cart functionality)
2. Navigate to `/checkout`
3. Follow each step:
   - Review items
   - Select supplier
   - Enter details
   - Confirm order
4. Check order history at `/profile/orders`
5. Verify notifications appear

## Design Considerations

### User Experience

- **Progressive Disclosure**: Show only relevant information at each step
- **Clear Visual Hierarchy**: Use color, size, and spacing to guide attention
- **Reassuring Messaging**: Emphasize "reservation" rather than "purchase" for beta
- **Error Prevention**: Validate before allowing progression to next step
- **Easy Recovery**: Allow users to go back and modify previous choices

### Performance

- **Client-Side Validation**: Quick feedback without server requests
- **Optimistic Updates**: Update UI immediately, rollback on error
- **Lazy Loading**: Load order details only when needed
- **LocalStorage**: Cache notifications for offline viewing

### Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Screen reader friendly labels
- **Color Contrast**: WCAG AA compliant color combinations
- **Error Messages**: Clear, descriptive error text with field association

## Future Enhancements

### Payment Processing
- Integrate Stripe/PayPal for actual payments
- Save payment methods for future orders
- Process refunds and cancellations

### Advanced Features
- Schedule pickup/delivery time slots
- Bulk order discounts
- Supplier ratings and reviews
- Order modification after placement
- Split orders across multiple suppliers
- Real-time inventory tracking

### Analytics
- Track conversion rates
- Monitor abandonment points
- Analyze supplier popularity
- Measure fulfillment preferences

## Troubleshooting

### Common Issues

**Issue**: Cart appears empty on checkout page
- **Solution**: Verify cart state management is working correctly
- Check that CartContext/Redux is properly initialized

**Issue**: Form validation not working
- **Solution**: Ensure all required fields have proper validation
- Check that error states are properly displayed

**Issue**: Notifications not appearing
- **Solution**: Check browser notification permissions
- Verify NotificationService is initialized

**Issue**: Order not saving to database
- **Solution**: Check backend API endpoints are running
- Verify request payload matches expected format
- Check network tab for errors

## Support

For questions or issues related to the checkout flow:

1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Verify API endpoints are accessible
5. Test with mock data first

## Changelog

### v1.0.0 (Initial Release)
- Multi-step checkout wizard
- Supplier selection with distance
- Pickup/delivery options
- Form validation
- Order confirmation
- Order history
- Basic notifications
- Reservation system (no payment)
