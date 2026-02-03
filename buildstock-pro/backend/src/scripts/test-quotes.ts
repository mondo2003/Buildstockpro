/**
 * Test script for Quote System
 * Tests all quote functionality end-to-end
 */

import { quoteService } from '../services/quoteService';

// Test data
const testUserId = 'test-user-' + Date.now();
const testQuoteData = {
  user_id: testUserId,
  title: 'Test Quote - Construction Materials',
  delivery_location: '123 Building Site, Construction Lane',
  delivery_postcode: 'SW1A 1AA',
  notes: 'Please deliver before 10 AM',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  items: [
    {
      product_name: 'Cement Bag 25kg',
      retailer: 'screwfix',
      quantity: 10,
      unit_price: 5.99,
      total_price: 59.90,
      notes: 'Portland cement',
    },
    {
      product_name: 'Bricks (Pack of 100)',
      retailer: 'wickes',
      quantity: 5,
      unit_price: 45.00,
      total_price: 225.00,
      notes: 'Red clay bricks',
    },
  ],
};

const testResponseData = {
  responder_name: 'John Smith',
  responder_email: 'john@example.com',
  response_message: 'We can fulfill this order within 3 days',
  quoted_total: 284.90,
  valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
};

// Test functions
async function testCreateQuote() {
  console.log('\n=== TEST 1: Create Quote with Items ===');
  try {
    const quote = await quoteService.createQuote(testQuoteData);

    if (!quote) {
      console.error('❌ FAIL: Failed to create quote');
      return null;
    }

    console.log('✅ PASS: Quote created successfully');
    console.log('Quote ID:', quote.id);
    console.log('Title:', quote.title);
    console.log('Status:', quote.status);
    console.log('Items count:', quote.items?.length);
    console.log('Total items:', quote.items?.reduce((sum, item) => sum + item.total_price, 0).toFixed(2));

    return quote;
  } catch (error) {
    console.error('❌ FAIL: Error creating quote:', error);
    return null;
  }
}

async function testGetQuotes(quoteId?: string) {
  console.log('\n=== TEST 2: List User Quotes ===');
  try {
    const result = await quoteService.getQuotes(testUserId, {
      page: 1,
      page_size: 10,
      sort: 'created_at',
      order: 'desc',
    });

    console.log('✅ PASS: Quotes retrieved successfully');
    console.log('Total quotes:', result.total);
    console.log('Page:', result.page, 'of', result.total_pages);
    console.log('Quotes on this page:', result.data.length);

    if (result.data.length > 0) {
      const firstQuote = result.data[0];
      console.log('First quote:', firstQuote.title);
      console.log('First quote status:', firstQuote.status);
      console.log('First quote items:', firstQuote.items?.length);
    }

    return result;
  } catch (error) {
    console.error('❌ FAIL: Error listing quotes:', error);
    return null;
  }
}

async function testGetQuoteById(quoteId: string) {
  console.log('\n=== TEST 3: Get Single Quote ===');
  try {
    const quote = await quoteService.getQuoteById(quoteId, testUserId);

    if (!quote) {
      console.error('❌ FAIL: Quote not found');
      return null;
    }

    console.log('✅ PASS: Quote retrieved successfully');
    console.log('ID:', quote.id);
    console.log('Title:', quote.title);
    console.log('Status:', quote.status);
    console.log('Delivery location:', quote.delivery_location);
    console.log('Postcode:', quote.delivery_postcode);
    console.log('Notes:', quote.notes);
    console.log('Items:', quote.items?.length);
    console.log('Responses:', quote.responses?.length);

    return quote;
  } catch (error) {
    console.error('❌ FAIL: Error fetching quote:', error);
    return null;
  }
}

async function testUpdateQuoteStatus(quoteId: string) {
  console.log('\n=== TEST 4: Update Quote Status ===');
  try {
    const updatedQuote = await quoteService.updateQuoteStatus(quoteId, testUserId, 'sent');

    if (!updatedQuote) {
      console.error('❌ FAIL: Failed to update quote status');
      return null;
    }

    console.log('✅ PASS: Quote status updated successfully');
    console.log('New status:', updatedQuote.status);

    return updatedQuote;
  } catch (error) {
    console.error('❌ FAIL: Error updating quote status:', error);
    return null;
  }
}

async function testAddQuoteItem(quoteId: string) {
  console.log('\n=== TEST 5: Add Item to Quote ===');
  try {
    const newItem = {
      product_name: 'Timber 2x4 (3m)',
      retailer: 'toolstation',
      quantity: 20,
      unit_price: 8.50,
      total_price: 170.00,
      notes: 'Treated timber',
    };

    const item = await quoteService.addQuoteItem(quoteId, newItem);

    if (!item) {
      console.error('❌ FAIL: Failed to add item');
      return null;
    }

    console.log('✅ PASS: Item added successfully');
    console.log('Item ID:', item.id);
    console.log('Product:', item.product_name);
    console.log('Quantity:', item.quantity);
    console.log('Total price:', item.total_price);

    return item;
  } catch (error) {
    console.error('❌ FAIL: Error adding item:', error);
    return null;
  }
}

async function testAddQuoteResponse(quoteId: string) {
  console.log('\n=== TEST 6: Add Merchant Response ===');
  try {
    const response = await quoteService.addQuoteResponse(quoteId, testResponseData);

    if (!response) {
      console.error('❌ FAIL: Failed to add response');
      return null;
    }

    console.log('✅ PASS: Response added successfully');
    console.log('Response ID:', response.id);
    console.log('Responder:', response.responder_name);
    console.log('Email:', response.responder_email);
    console.log('Message:', response.response_message);
    console.log('Quoted total:', response.quoted_total);

    return response;
  } catch (error) {
    console.error('❌ FAIL: Error adding response:', error);
    return null;
  }
}

async function testGetQuoteStats() {
  console.log('\n=== TEST 7: Get Quote Statistics ===');
  try {
    const stats = await quoteService.getQuoteStats(testUserId);

    console.log('✅ PASS: Statistics retrieved successfully');
    console.log('Total quotes:', stats.total);
    console.log('Pending:', stats.pending);
    console.log('Sent:', stats.sent);
    console.log('Responded:', stats.responded);
    console.log('Expired:', stats.expired);
    console.log('Cancelled:', stats.cancelled);

    return stats;
  } catch (error) {
    console.error('❌ FAIL: Error fetching stats:', error);
    return null;
  }
}

async function testUpdateQuote(quoteId: string) {
  console.log('\n=== TEST 8: Update Quote Details ===');
  try {
    const updates = {
      title: 'Updated Quote - Construction Materials (Revised)',
      notes: 'Updated: Please deliver before 9 AM. Contact confirmed.',
    };

    const updatedQuote = await quoteService.updateQuote(quoteId, testUserId, updates);

    if (!updatedQuote) {
      console.error('❌ FAIL: Failed to update quote');
      return null;
    }

    console.log('✅ PASS: Quote updated successfully');
    console.log('New title:', updatedQuote.title);
    console.log('New notes:', updatedQuote.notes);

    return updatedQuote;
  } catch (error) {
    console.error('❌ FAIL: Error updating quote:', error);
    return null;
  }
}

async function testCheckUserOwnsQuote(quoteId: string) {
  console.log('\n=== TEST 9: Check User Ownership ===');
  try {
    const ownsQuote = await quoteService.checkUserOwnsQuote(quoteId, testUserId);

    if (ownsQuote) {
      console.log('✅ PASS: User ownership verified');
    } else {
      console.error('❌ FAIL: User does not own this quote');
    }

    // Test with wrong user ID
    const ownsQuoteWrong = await quoteService.checkUserOwnsQuote(quoteId, 'wrong-user-id');
    if (!ownsQuoteWrong) {
      console.log('✅ PASS: Correctly rejected wrong user');
    } else {
      console.error('❌ FAIL: Should have rejected wrong user');
    }

    return ownsQuote;
  } catch (error) {
    console.error('❌ FAIL: Error checking ownership:', error);
    return false;
  }
}

async function testDeleteQuote(quoteId: string) {
  console.log('\n=== TEST 10: Delete Quote ===');
  try {
    const success = await quoteService.deleteQuote(quoteId, testUserId);

    if (!success) {
      console.error('❌ FAIL: Failed to delete quote');
      return false;
    }

    console.log('✅ PASS: Quote deleted successfully');

    // Verify quote is gone
    const quote = await quoteService.getQuoteById(quoteId, testUserId);
    if (!quote) {
      console.log('✅ PASS: Verified quote is deleted');
    } else {
      console.error('❌ FAIL: Quote still exists after deletion');
    }

    return true;
  } catch (error) {
    console.error('❌ FAIL: Error deleting quote:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('QUOTE SYSTEM TEST SUITE');
  console.log('========================================');
  console.log('Test User ID:', testUserId);
  console.log('Starting tests...\n');

  let createdQuoteId: string | null = null;

  try {
    // Test 1: Create quote
    const quote = await testCreateQuote();
    if (!quote || !quote.id) {
      console.error('\n❌ FATAL: Could not create quote. Stopping tests.');
      return;
    }
    createdQuoteId = quote.id;

    // Test 2: List quotes
    await testGetQuotes(createdQuoteId);

    // Test 3: Get single quote
    await testGetQuoteById(createdQuoteId);

    // Test 4: Update status
    await testUpdateQuoteStatus(createdQuoteId);

    // Test 5: Add item
    await testAddQuoteItem(createdQuoteId);

    // Test 6: Add response
    await testAddQuoteResponse(createdQuoteId);

    // Test 7: Get stats
    await testGetQuoteStats();

    // Test 8: Update quote
    await testUpdateQuote(createdQuoteId);

    // Test 9: Check ownership
    await testCheckUserOwnsQuote(createdQuoteId);

    // Test 10: Delete quote
    await testDeleteQuote(createdQuoteId);

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETED');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
  }
}

// Run tests
runAllTests().catch(console.error);
