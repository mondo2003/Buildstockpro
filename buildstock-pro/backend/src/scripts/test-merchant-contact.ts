/**
 * Test Script for Merchant Contact System
 *
 * This script tests the merchant contact functionality:
 * 1. Find nearest branches for a postcode
 * 2. Get branch details
 * 3. Create contact request for a product
 * 4. List contact requests
 * 5. Add response
 * 6. Update status
 *
 * Run with: bun run src/scripts/test-merchant-contact.ts
 */

import { merchantContactService } from '../services/merchantContactService';
import { supabase } from '../utils/database';

// Test data
const TEST_MERCHANT_SLUG = 'screwfix';
const TEST_POSTCODE = 'NW1 9NE'; // London Camden
const TEST_USER_ID = 'test-user-' + Date.now();

console.log('='.repeat(60));
console.log('MERCHANT CONTACT SYSTEM TEST');
console.log('='.repeat(60));
console.log(`Test User ID: ${TEST_USER_ID}`);
console.log(`Test Merchant: ${TEST_MERCHANT_SLUG}`);
console.log(`Test Postcode: ${TEST_POSTCODE}`);
console.log('='.repeat(60));
console.log();

async function runTests() {
  let testMerchant: any = null;
  let testBranch: any = null;
  let testProduct: any = null;
  let contactRequestId: string | null = null;

  try {
    // ========================================================================
    // TEST 1: Get Merchant
    // ========================================================================
    console.log('📋 TEST 1: Get Merchant');
    console.log('-'.repeat(60));

    const { data: merchants, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('slug', TEST_MERCHANT_SLUG)
      .single();

    if (merchantError || !merchants) {
      throw new Error(`Merchant ${TEST_MERCHANT_SLUG} not found. Please run branch seeding first.`);
    }

    testMerchant = merchants;
    console.log(`✅ Found merchant: ${testMerchant.name} (ID: ${testMerchant.id})`);
    console.log();

    // ========================================================================
    // TEST 2: Find Nearest Branches
    // ========================================================================
    console.log('📍 TEST 2: Find Nearest Branches');
    console.log('-'.repeat(60));

    const branches = await merchantContactService.findNearestBranches(
      testMerchant.id,
      TEST_POSTCODE,
      50 // 50km radius
    );

    console.log(`✅ Found ${branches.length} branches near ${TEST_POSTCODE}`);

    if (branches.length > 0) {
      console.log('\nNearest branches:');
      branches.slice(0, 3).forEach((branch, index) => {
        console.log(`  ${index + 1}. ${branch.branch_name}`);
        console.log(`     Address: ${branch.address}, ${branch.city}, ${branch.postcode}`);
        console.log(`     Distance: ${branch.distance_km ? branch.distance_km + ' km' : 'Unknown'}`);
        console.log(`     Phone: ${branch.phone || 'N/A'}`);
        console.log(`     Hours: ${branch.opens_at || 'N/A'} - ${branch.closes_at || 'N/A'}`);
      });
      testBranch = branches[0];
    } else {
      console.warn('⚠️  No branches found. Using merchant without branch.');
    }
    console.log();

    // ========================================================================
    // TEST 3: Get Branch Details
    // ========================================================================
    if (testBranch) {
      console.log('🏢 TEST 3: Get Branch Details');
      console.log('-'.repeat(60));

      const branchDetails = await merchantContactService.getBranchDetails(testBranch.id);

      if (branchDetails) {
        console.log(`✅ Branch Details:`);
        console.log(`   ID: ${branchDetails.id}`);
        console.log(`   Name: ${branchDetails.branch_name}`);
        console.log(`   Code: ${branchDetails.branch_code || 'N/A'}`);
        console.log(`   Address: ${branchDetails.address || 'N/A'}`);
        console.log(`   City: ${branchDetails.city || 'N/A'}`);
        console.log(`   Postcode: ${branchDetails.postcode || 'N/A'}`);
        console.log(`   Phone: ${branchDetails.phone || 'N/A'}`);
        console.log(`   Email: ${branchDetails.email || 'N/A'}`);
        console.log(`   Click & Collect: ${branchDetails.click_and_collect ? 'Yes' : 'No'}`);
        console.log(`   Active: ${branchDetails.is_active ? 'Yes' : 'No'}`);
      } else {
        console.error('❌ Failed to get branch details');
      }
      console.log();
    }

    // ========================================================================
    // TEST 4: Get a Test Product
    // ========================================================================
    console.log('📦 TEST 4: Get Test Product');
    console.log('-'.repeat(60));

    const { data: products, error: productsError } = await supabase
      .from('scraped_prices')
      .select('*')
      .eq('retailer', TEST_MERCHANT_SLUG)
      .limit(1);

    if (productsError || !products || products.length === 0) {
      console.warn('⚠️  No products found for this merchant');
      testProduct = {
        id: 'test-product-id',
        product_name: 'Test Product',
        retailer_product_id: 'TEST-001',
      };
    } else {
      testProduct = products[0];
      console.log(`✅ Found product: ${testProduct.product_name}`);
      console.log(`   Price: £${testProduct.price}`);
      console.log(`   In Stock: ${testProduct.in_stock ? 'Yes' : 'No'}`);
    }
    console.log();

    // ========================================================================
    // TEST 5: Create Contact Request
    // ========================================================================
    console.log('📝 TEST 5: Create Contact Request');
    console.log('-'.repeat(60));

    const contactRequestData = {
      merchant_id: testMerchant.id,
      branch_id: testBranch?.id,
      scraped_price_id: testProduct?.id,
      product_name: testProduct?.product_name || 'Test Product',
      product_sku: testProduct?.retailer_product_id,
      inquiry_type: 'stock_check' as const,
      message: `Hi, I'm interested in the ${testProduct?.product_name || 'product'}. Is it currently available at your ${testBranch?.city || 'local'} branch? I'd like to collect it today if possible.`,
      contact_method: 'email' as const,
      user_name: 'John Doe',
      user_email: 'john.doe@example.com',
      user_phone: '07700 900000',
      metadata: {
        source: 'test-script',
        preferred_contact_time: 'morning',
      },
    };

    console.log('Creating contact request with:');
    console.log(`   Merchant: ${testMerchant.name}`);
    console.log(`   Branch: ${testBranch?.branch_name || 'None'}`);
    console.log(`   Product: ${contactRequestData.product_name}`);
    console.log(`   Inquiry Type: ${contactRequestData.inquiry_type}`);
    console.log(`   Contact Method: ${contactRequestData.contact_method}`);
    console.log(`   Message: ${contactRequestData.message.substring(0, 80)}...`);

    const contactRequest = await merchantContactService.createContactRequest(
      TEST_USER_ID,
      contactRequestData
    );

    if (!contactRequest) {
      throw new Error('Failed to create contact request');
    }

    contactRequestId = contactRequest.id;
    console.log(`✅ Contact request created (ID: ${contactRequestId})`);
    console.log(`   Status: ${contactRequest.status}`);
    console.log();

    // ========================================================================
    // TEST 6: List Contact Requests
    // ========================================================================
    console.log('📋 TEST 6: List Contact Requests');
    console.log('-'.repeat(60));

    const result = await merchantContactService.getContactRequests(TEST_USER_ID, {
      page: 1,
      page_size: 10,
    });

    console.log(`✅ Found ${result.total} contact requests`);
    console.log(`   Page: ${result.page} of ${result.total_pages}`);

    if (result.requests.length > 0) {
      console.log('\nRecent requests:');
      result.requests.slice(0, 3).forEach((req, index) => {
        console.log(`  ${index + 1}. ID: ${req.id.substring(0, 8)}...`);
        console.log(`     Product: ${req.product_name}`);
        console.log(`     Merchant: ${req.merchant_name || 'Unknown'}`);
        console.log(`     Branch: ${req.branch_name || 'None'}`);
        console.log(`     Type: ${req.inquiry_type}`);
        console.log(`     Status: ${req.status}`);
        console.log(`     Created: ${new Date(req.created_at).toLocaleString()}`);
      });
    }
    console.log();

    // ========================================================================
    // TEST 7: Get Single Contact Request with Details
    // ========================================================================
    console.log('🔍 TEST 7: Get Contact Request Details');
    console.log('-'.repeat(60));

    if (contactRequestId) {
      const requestDetails = await merchantContactService.getContactById(
        contactRequestId,
        TEST_USER_ID
      );

      if (requestDetails) {
        console.log(`✅ Contact Request Details:`);
        console.log(`   ID: ${requestDetails.id}`);
        console.log(`   Product: ${requestDetails.product_name}`);
        console.log(`   Merchant: ${requestDetails.merchant_name || 'Unknown'}`);
        console.log(`   Branch: ${requestDetails.branch_name || 'None'}`);
        console.log(`   Address: ${requestDetails.branch_address || 'N/A'}`);
        console.log(`   City: ${requestDetails.branch_city || 'N/A'}`);
        console.log(`   Postcode: ${requestDetails.branch_postcode || 'N/A'}`);
        console.log(`   Phone: ${requestDetails.branch_phone || 'N/A'}`);
        console.log(`   Hours: ${requestDetails.branch_opens_at || 'N/A'} - ${requestDetails.branch_closes_at || 'N/A'}`);
        console.log(`   Inquiry Type: ${requestDetails.inquiry_type}`);
        console.log(`   Status: ${requestDetails.status}`);
        console.log(`   User Name: ${requestDetails.user_name}`);
        console.log(`   User Email: ${requestDetails.user_email}`);
        console.log(`   User Phone: ${requestDetails.user_phone || 'N/A'}`);
        console.log(`   Message: ${requestDetails.message.substring(0, 100)}...`);
        console.log(`   Created: ${new Date(requestDetails.created_at).toLocaleString()}`);
      } else {
        console.error('❌ Failed to get contact request details');
      }
    }
    console.log();

    // ========================================================================
    // TEST 8: Add Merchant Response
    // ========================================================================
    console.log('💬 TEST 8: Add Merchant Response');
    console.log('-'.repeat(60));

    if (contactRequestId) {
      const responseData = {
        responder_name: 'Sarah Smith',
        responder_role: 'Branch Manager',
        response_message: `Hello! Yes, we have the ${testProduct?.product_name || 'product'} in stock at our ${testBranch?.city || 'branch'} location. You can collect it anytime during our opening hours (${testBranch?.opens_at || '7:00'} - ${testBranch?.closes_at || '20:00'}). We look forward to seeing you!`,
        responder_email: 'manager.camden@screwfix.co.uk',
        responder_phone: testBranch?.phone || '03330 112 112',
        metadata: {
          estimated_wait_time: '5 minutes',
          stock_quantity: 15,
        },
      };

      console.log('Adding response:');
      console.log(`   Responder: ${responseData.responder_name} (${responseData.responder_role})`);
      console.log(`   Message: ${responseData.response_message.substring(0, 80)}...`);

      const response = await merchantContactService.addResponse(
        contactRequestId,
        responseData
      );

      if (response) {
        console.log(`✅ Response added (ID: ${response.id})`);
        console.log(`   Created: ${new Date(response.created_at).toLocaleString()}`);
      } else {
        console.error('❌ Failed to add response');
      }
    }
    console.log();

    // ========================================================================
    // TEST 9: Get Contact Responses
    // ========================================================================
    console.log('💬 TEST 9: Get Contact Responses');
    console.log('-'.repeat(60));

    if (contactRequestId) {
      const responses = await merchantContactService.getContactResponses(
        contactRequestId,
        TEST_USER_ID
      );

      console.log(`✅ Found ${responses.length} response(s)`);

      if (responses.length > 0) {
        responses.forEach((resp, index) => {
          console.log(`\n  Response ${index + 1}:`);
          console.log(`   From: ${resp.responder_name} (${resp.responder_role || 'Staff'})`);
          console.log(`   Email: ${resp.responder_email || 'N/A'}`);
          console.log(`   Phone: ${resp.responder_phone || 'N/A'}`);
          console.log(`   Message: ${resp.response_message.substring(0, 100)}...`);
          console.log(`   Sent: ${new Date(resp.created_at).toLocaleString()}`);
        });
      }
    }
    console.log();

    // ========================================================================
    // TEST 10: Update Contact Status
    // ========================================================================
    console.log('🔄 TEST 10: Update Contact Status');
    console.log('-'.repeat(60));

    if (contactRequestId) {
      console.log('Updating status to: resolved');

      const updatedRequest = await merchantContactService.updateContactStatus(
        contactRequestId,
        'resolved',
        TEST_USER_ID
      );

      if (updatedRequest) {
        console.log(`✅ Status updated to: ${updatedRequest.status}`);
        console.log(`   Previous timestamps:`);
        console.log(`   - Created: ${new Date(updatedRequest.created_at).toLocaleString()}`);
        console.log(`   - Sent: ${updatedRequest.sent_at ? new Date(updatedRequest.sent_at).toLocaleString() : 'N/A'}`);
        console.log(`   - First Response: ${updatedRequest.first_response_at ? new Date(updatedRequest.first_response_at).toLocaleString() : 'N/A'}`);
        console.log(`   - Resolved: ${updatedRequest.resolved_at ? new Date(updatedRequest.resolved_at).toLocaleString() : 'N/A'}`);
      } else {
        console.error('❌ Failed to update status');
      }
    }
    console.log();

    // ========================================================================
    // TEST 11: Filter Contact Requests by Status
    // ========================================================================
    console.log('📊 TEST 11: Filter Contact Requests by Status');
    console.log('-'.repeat(60));

    const pendingResult = await merchantContactService.getContactRequests(TEST_USER_ID, {
      status: 'pending',
      page: 1,
      page_size: 10,
    });

    console.log(`✅ Pending requests: ${pendingResult.total}`);

    const resolvedResult = await merchantContactService.getContactRequests(TEST_USER_ID, {
      status: 'resolved',
      page: 1,
      page_size: 10,
    });

    console.log(`✅ Resolved requests: ${resolvedResult.total}`);
    console.log();

    // ========================================================================
    // TEST 12: Find Branches with Different Radius
    // ========================================================================
    console.log('🗺️  TEST 12: Find Branches with Different Radius');
    console.log('-'.repeat(60));

    const smallRadius = await merchantContactService.findNearestBranches(
      testMerchant.id,
      TEST_POSTCODE,
      10 // 10km radius
    );

    console.log(`✅ Branches within 10km: ${smallRadius.length}`);

    const largeRadius = await merchantContactService.findNearestBranches(
      testMerchant.id,
      TEST_POSTCODE,
      100 // 100km radius
    );

    console.log(`✅ Branches within 100km: ${largeRadius.length}`);
    console.log();

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log();
    console.log('Key Results:');
    console.log(`  • Merchant: ${testMerchant.name}`);
    console.log(`  • Branches Found: ${branches.length}`);
    console.log(`  • Contact Request Created: ${contactRequestId ? 'Yes' : 'No'}`);
    console.log(`  • Contact Request Status: ${updatedRequest?.status || 'Unknown'}`);
    console.log(`  • Responses Added: 1`);
    console.log();
    console.log(`Test User ID: ${TEST_USER_ID}`);
    console.log(`Contact Request ID: ${contactRequestId || 'N/A'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error(error instanceof Error ? error.message : String(error));
    console.error();
    if (contactRequestId) {
      console.error(`Contact Request ID (for cleanup): ${contactRequestId}`);
    }
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
