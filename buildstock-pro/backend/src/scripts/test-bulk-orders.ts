/**
 * Bulk Orders Test Script
 * Tests the bulk order system functionality
 */

import { bulkOrderService } from '../services/bulkOrderService';
import { supabase } from '../utils/database';

// Test user ID (you'll need to use a real user ID from your database)
const TEST_USER_ID = 'test-user-id';

// Helper to get a real scraped price ID
async function getScrapedPriceIds(limit: number = 5): Promise<string[]> {
  const { data, error } = await supabase
    .from('scraped_prices')
    .select('id')
    .limit(limit);

  if (error || !data) {
    console.error('Error getting scraped price IDs:', error);
    return [];
  }

  return data.map(p => p.id);
}

// Helper to create a test user if needed
async function getOrCreateTestUser(): Promise<string> {
  // Try to get an existing user first
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    console.log('Using existing user:', existingUsers[0].id);
    return existingUsers[0].id;
  }

  // If no users exist, you'll need to create one or use auth
  console.warn('No users found. Please create a user in the database first.');
  return TEST_USER_ID;
}

// Test 1: Create a bulk order with multiple items from different retailers
async function testCreateBulkOrder() {
  console.log('\n========================================');
  console.log('TEST 1: Create Bulk Order with Items');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();
    const priceIds = await getScrapedPriceIds(5);

    if (priceIds.length === 0) {
      console.error('❌ No scraped prices found in database. Please run a scraper first.');
      return null;
    }

    console.log(`Found ${priceIds.length} price IDs to use for testing`);

    const orderData = {
      delivery_location: 'Test Construction Site, 123 Builder Street',
      delivery_postcode: 'SW1A 1AA',
      customer_notes: 'Please deliver before 10 AM. Call on arrival.',
      items: priceIds.map(id => ({
        scraped_price_id: id,
        quantity: Math.floor(Math.random() * 10) + 1,
        notes: `Test notes for item ${id.substring(0, 8)}`,
      })),
    };

    const result = await bulkOrderService.createBulkOrder(userId, orderData);

    if (result) {
      console.log('✅ Bulk order created successfully');
      console.log('   Order Number:', result.order_number);
      console.log('   Status:', result.status);
      console.log('   Total Items:', result.total_items);
      console.log('   Total Retailers:', result.total_retailers);
      console.log('   Estimated Total: £', result.estimated_total);
      console.log('   Items:', result.items.length);
      console.log('   Retailers:', result.retailers.map(r => `${r.retailer} (${r.item_count} items)`).join(', '));
      return result;
    } else {
      console.error('❌ Failed to create bulk order');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in testCreateBulkOrder:', error);
    return null;
  }
}

// Test 2: List bulk orders
async function testListBulkOrders() {
  console.log('\n========================================');
  console.log('TEST 2: List Bulk Orders');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();

    const result = await bulkOrderService.getBulkOrders(userId, {
      page: 1,
      page_size: 10,
    });

    console.log(`✅ Found ${result.total} orders`);
    console.log(`   Page: ${result.page} of ${result.totalPages}`);

    result.orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.order_number} - ${order.status} - £${order.estimated_total}`);
    });

    return result;
  } catch (error) {
    console.error('❌ Error in testListBulkOrders:', error);
    return null;
  }
}

// Test 3: Get single bulk order
async function testGetBulkOrder(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 3: Get Single Bulk Order');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();

    const order = await bulkOrderService.getBulkOrderById(orderId, userId);

    if (order) {
      console.log('✅ Order retrieved successfully');
      console.log('   Order Number:', order.order_number);
      console.log('   Status:', order.status);
      console.log('   Delivery:', order.delivery_location);
      console.log('   Postcode:', order.delivery_postcode);
      console.log('   Customer Notes:', order.customer_notes);
      console.log('   Items:');
      order.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.product_name} (${item.retailer}) - Qty: ${item.quantity} @ £${item.unit_price}`);
      });
      console.log('   Retailers:');
      order.retailers.forEach((retailer, index) => {
        console.log(`      ${index + 1}. ${retailer.retailer} - ${retailer.item_count} items - £${retailer.retailer_total} (${retailer.retailer_status})`);
      });
      return order;
    } else {
      console.error('❌ Order not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in testGetBulkOrder:', error);
    return null;
  }
}

// Test 4: Add item to order
async function testAddItem(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 4: Add Item to Order');
  console.log('========================================');

  try {
    const priceIds = await getScrapedPriceIds(1);

    if (priceIds.length === 0) {
      console.error('❌ No scraped prices found');
      return false;
    }

    const item = await bulkOrderService.addOrderItem(orderId, {
      scraped_price_id: priceIds[0],
      quantity: 5,
      notes: 'Added during test',
    });

    if (item) {
      console.log('✅ Item added successfully');
      console.log('   Product:', item.product_name);
      console.log('   Retailer:', item.retailer);
      console.log('   Quantity:', item.quantity);
      console.log('   Total Price: £', item.total_price);
      return true;
    } else {
      console.error('❌ Failed to add item');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testAddItem:', error);
    return false;
  }
}

// Test 5: Update item in order
async function testUpdateItem(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 5: Update Item in Order');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();
    const order = await bulkOrderService.getBulkOrderById(orderId, userId);

    if (!order || order.items.length === 0) {
      console.error('❌ No items found in order');
      return false;
    }

    const firstItem = order.items[0];
    const newQuantity = firstItem.quantity + 2;

    const updated = await bulkOrderService.updateOrderItem(firstItem.id, {
      quantity: newQuantity,
      notes: 'Updated during test',
    });

    if (updated) {
      console.log('✅ Item updated successfully');
      console.log('   Old Quantity:', firstItem.quantity);
      console.log('   New Quantity:', updated.quantity);
      console.log('   New Total: £', updated.total_price);
      return true;
    } else {
      console.error('❌ Failed to update item');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testUpdateItem:', error);
    return false;
  }
}

// Test 6: Remove item from order
async function testRemoveItem(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 6: Remove Item from Order');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();
    const order = await bulkOrderService.getBulkOrderById(orderId, userId);

    if (!order || order.items.length === 0) {
      console.error('❌ No items found in order');
      return false;
    }

    const lastItem = order.items[order.items.length - 1];

    const success = await bulkOrderService.removeOrderItem(lastItem.id);

    if (success) {
      console.log('✅ Item removed successfully');
      console.log('   Removed:', lastItem.product_name);
      console.log('   Remaining items:', order.items.length - 1);
      return true;
    } else {
      console.error('❌ Failed to remove item');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testRemoveItem:', error);
    return false;
  }
}

// Test 7: Get retailer breakdown
async function testRetailerBreakdown(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 7: Get Retailer Breakdown');
  console.log('========================================');

  try {
    const retailers = await bulkOrderService.groupByRetailer(orderId);

    console.log(`✅ Found ${retailers.length} retailers in order`);

    retailers.forEach((retailer, index) => {
      console.log(`   ${index + 1}. ${retailer.retailer}`);
      console.log(`      Items: ${retailer.item_count}`);
      console.log(`      Total: £${retailer.retailer_total}`);
      console.log(`      Status: ${retailer.retailer_status}`);
    });

    return retailers;
  } catch (error) {
    console.error('❌ Error in testRetailerBreakdown:', error);
    return null;
  }
}

// Test 8: Submit order
async function testSubmitOrder(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 8: Submit Order');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();
    const success = await bulkOrderService.submitBulkOrder(orderId, userId);

    if (success) {
      console.log('✅ Order submitted successfully');

      const updatedOrder = await bulkOrderService.getBulkOrderById(orderId, userId);
      if (updatedOrder) {
        console.log('   New Status:', updatedOrder.status);
      }

      return true;
    } else {
      console.error('❌ Failed to submit order');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testSubmitOrder:', error);
    return false;
  }
}

// Test 9: Update order details
async function testUpdateOrder(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 9: Update Order Details');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();

    const updated = await bulkOrderService.updateBulkOrder(orderId, userId, {
      delivery_location: 'Updated delivery location',
      delivery_postcode: 'EC1A 1BB',
      customer_notes: 'Updated customer notes',
    });

    if (updated) {
      console.log('✅ Order updated successfully');
      console.log('   New Location:', updated.delivery_location);
      console.log('   New Postcode:', updated.delivery_postcode);
      console.log('   New Notes:', updated.customer_notes);
      return true;
    } else {
      console.error('❌ Failed to update order');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testUpdateOrder:', error);
    return false;
  }
}

// Test 10: Cancel order
async function testCancelOrder(orderId: string) {
  console.log('\n========================================');
  console.log('TEST 10: Cancel Order');
  console.log('========================================');

  try {
    const userId = await getOrCreateTestUser();
    const success = await bulkOrderService.cancelBulkOrder(orderId, userId);

    if (success) {
      console.log('✅ Order cancelled successfully');
      return true;
    } else {
      console.error('❌ Failed to cancel order');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in testCancelOrder:', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     BULK ORDERS SYSTEM TEST SUITE                    ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    // Test 1: Create order
    const order = await testCreateBulkOrder();
    if (!order) {
      console.error('\n❌ Cannot continue tests without an order');
      return;
    }

    const orderId = order.id;

    // Test 2: List orders
    await testListBulkOrders();

    // Test 3: Get single order
    await testGetBulkOrder(orderId);

    // Test 4: Add item
    await testAddItem(orderId);

    // Test 5: Update item
    await testUpdateItem(orderId);

    // Test 6: Remove item
    await testRemoveItem(orderId);

    // Test 7: Get retailer breakdown
    await testRetailerBreakdown(orderId);

    // Test 8: Update order details
    await testUpdateOrder(orderId);

    // Test 9: Submit order (skip if we want to test cancellation)
    // await testSubmitOrder(orderId);

    // Test 10: Cancel order
    await testCancelOrder(orderId);

    const duration = Date.now() - startTime;

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log(`║     ALL TESTS COMPLETED IN ${duration}ms               ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
