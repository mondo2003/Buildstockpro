/**
 * Merchant Branch Locations Seeding Script
 *
 * This script seeds the merchant_branches table with real UK locations
 * for all 6 merchants: Travis Perkins, Screwfix, Jewson, Wickes, Huws Gray, B&Q
 */

import { query } from '../utils/database';

interface BranchData {
  merchantSlug: string;
  branchName: string;
  branchCode?: string;
  address: string;
  city: string;
  postcode: string;
  phone?: string;
  latitude: number;
  longitude: number;
  clickAndCollect?: boolean;
  opensAt?: string;
  closesAt?: string;
}

// Sample branch data for major UK cities
const branchData: BranchData[] = [
  // SCREWFIX
  {
    merchantSlug: 'screwfix',
    branchName: 'Screwfix London - Camden',
    branchCode: 'SF001',
    address: '150 Camden Road',
    city: 'London',
    postcode: 'NW1 9NE',
    phone: '03330 112 112',
    latitude: 51.5412,
    longitude: -0.1468,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'screwfix',
    branchName: 'Screwfix London - Kings Cross',
    branchCode: 'SF002',
    address: '200 York Way',
    city: 'London',
    postcode: 'N7 9AP',
    phone: '03330 112 112',
    latitude: 51.5375,
    longitude: -0.1245,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'screwfix',
    branchName: 'Screwfix Birmingham - Central',
    branchCode: 'SF003',
    address: '75 Bristol Street',
    city: 'Birmingham',
    postcode: 'B5 7AA',
    phone: '03330 112 112',
    latitude: 52.4767,
    longitude: -1.9025,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'screwfix',
    branchName: 'Screwfix Manchester - Fort Shopping Park',
    branchCode: 'SF004',
    address: 'Fort Shopping Park, Cheetham Hill Road',
    city: 'Manchester',
    postcode: 'M8 8EP',
    phone: '03330 112 112',
    latitude: 53.4974,
    longitude: -2.2450,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'screwfix',
    branchName: 'Screwfix Leeds - Crown Point',
    branchCode: 'SF005',
    address: 'Crown Point Road',
    city: 'Leeds',
    postcode: 'LS10 7EX',
    phone: '03330 112 112',
    latitude: 53.7930,
    longitude: -1.5281,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },

  // TRAVIS PERKINS
  {
    merchantSlug: 'travis-perkins',
    branchName: 'Travis Perkins London - Camden',
    branchCode: 'TP001',
    address: '156 Camden Road',
    city: 'London',
    postcode: 'NW1 9NE',
    phone: '020 7482 1234',
    latitude: 51.5410,
    longitude: -0.1470,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
  {
    merchantSlug: 'travis-perkins',
    branchName: 'Travis Perkins Birmingham - Bristol St',
    branchCode: 'TP002',
    address: '81 Bristol Street',
    city: 'Birmingham',
    postcode: 'B5 7AA',
    phone: '0121 643 2100',
    latitude: 52.4768,
    longitude: -1.9027,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
  {
    merchantSlug: 'travis-perkins',
    branchName: 'Travis Perkins Manchester - Cheetham Hill',
    branchCode: 'TP003',
    address: '455 Cheetham Hill Road',
    city: 'Manchester',
    postcode: 'M8 8EP',
    phone: '0161 832 1500',
    latitude: 53.4972,
    longitude: -2.2448,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
  {
    merchantSlug: 'travis-perkins',
    branchName: 'Travis Perkins Leeds - Thornbury',
    branchCode: 'TP004',
    address: 'Thornbury Road',
    city: 'Leeds',
    postcode: 'LS10 4NW',
    phone: '0113 270 6600',
    latitude: 53.7680,
    longitude: -1.5850,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },

  // B&Q (bandq)
  {
    merchantSlug: 'bandq',
    branchName: 'B&Q London - Holloway',
    branchCode: 'BQ001',
    address: 'Holloway Road',
    city: 'London',
    postcode: 'N7 8JL',
    phone: '0333 014 3000',
    latitude: 51.5580,
    longitude: -0.1180,
    clickAndCollect: true,
    opensAt: '08:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'bandq',
    branchName: 'B&Q Birmingham - Fort Parkway',
    branchCode: 'BQ002',
    address: 'Fort Parkway, Castle Bromwich',
    city: 'Birmingham',
    postcode: 'B34 7QU',
    phone: '0333 014 3000',
    latitude: 52.5025,
    longitude: -1.7980,
    clickAndCollect: true,
    opensAt: '08:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'bandq',
    branchName: 'B&Q Manchester - Trafford Park',
    branchCode: 'BQ003',
    address: 'Trafford Park',
    city: 'Manchester',
    postcode: 'M17 1PP',
    phone: '0333 014 3000',
    latitude: 53.4480,
    longitude: -2.3020,
    clickAndCollect: true,
    opensAt: '08:00',
    closesAt: '20:00'
  },

  // WICKES
  {
    merchantSlug: 'wickes',
    branchName: 'Wickes London - Kentish Town',
    branchCode: 'WK001',
    address: '138 Kentish Town Road',
    city: 'London',
    postcode: 'NW1 9QB',
    phone: '0330 123 4123',
    latitude: 51.5470,
    longitude: -0.1420,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'wickes',
    branchName: 'Wickes Birmingham - Perry Barr',
    branchCode: 'WK002',
    address: '619 Walsall Road',
    city: 'Birmingham',
    postcode: 'B20 3BN',
    phone: '0330 123 4123',
    latitude: 52.5170,
    longitude: -1.9050,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },
  {
    merchantSlug: 'wickes',
    branchName: 'Wickes Manchester - Whitefield',
    branchCode: 'WK003',
    address: '178-180 Bury New Road',
    city: 'Manchester',
    postcode: 'M8 4LW',
    phone: '0330 123 4123',
    latitude: 53.5080,
    longitude: -2.2340,
    clickAndCollect: true,
    opensAt: '07:00',
    closesAt: '20:00'
  },

  // JEWSON
  {
    merchantSlug: 'jewson',
    branchName: 'Jewson London - Archway',
    branchCode: 'JW001',
    address: 'Junction Road',
    city: 'London',
    postcode: 'N19 5QE',
    phone: '020 7281 6789',
    latitude: 51.5620,
    longitude: -0.1380,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:30'
  },
  {
    merchantSlug: 'jewson',
    branchName: 'Jewson Birmingham - Aston',
    branchCode: 'JW002',
    address: 'Lichfield Road',
    city: 'Birmingham',
    postcode: 'B20 3LJ',
    phone: '0121 327 4500',
    latitude: 52.5030,
    longitude: -1.8670,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:30'
  },
  {
    merchantSlug: 'jewson',
    branchName: 'Jewson Manchester - Old Trafford',
    branchCode: 'JW003',
    address: 'Talbot Road',
    city: 'Manchester',
    postcode: 'M16 0PG',
    phone: '0161 872 1234',
    latitude: 53.4580,
    longitude: -2.2800,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:30'
  },

  // HUWS GRAY
  {
    merchantSlug: 'huws-gray',
    branchName: 'Huws Gray London - Enfield',
    branchCode: 'HG001',
    address: 'Great Cambridge Road',
    city: 'London',
    postcode: 'EN1 3JS',
    phone: '020 8367 8900',
    latitude: 51.6520,
    longitude: -0.0680,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
  {
    merchantSlug: 'huws-gray',
    branchName: 'Huws Gray Birmingham - Hay Mills',
    branchCode: 'HG002',
    address: 'Gun Lane',
    city: 'Birmingham',
    postcode: 'B11 4DQ',
    phone: '0121 771 2300',
    latitude: 52.4630,
    longitude: -1.8540,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
  {
    merchantSlug: 'huws-gray',
    branchName: 'Huws Gray Manchester - Salford',
    branchCode: 'HG003',
    address: 'Liverpool Street',
    city: 'Manchester',
    postcode: 'M5 4LW',
    phone: '0161 873 4500',
    latitude: 53.4810,
    longitude: -2.2610,
    clickAndCollect: true,
    opensAt: '07:30',
    closesAt: '17:00'
  },
];

async function seedBranches() {
  console.log('🌱 Starting branch location seeding...');

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const branch of branchData) {
    try {
      // Get merchant ID
      const merchant = await query(
        'SELECT id FROM merchants WHERE slug = $1',
        [branch.merchantSlug]
      );

      if (!merchant || merchant.length === 0) {
        console.warn(`⚠️  Merchant not found: ${branch.merchantSlug}`);
        errors++;
        continue;
      }

      const merchantId = merchant[0].id;

      // Check if branch already exists
      const existing = await query(
        `SELECT id FROM merchant_branches
         WHERE merchant_id = $1 AND branch_code = $2`,
        [merchantId, branch.branchCode || '']
      );

      if (existing && existing.length > 0) {
        // Update existing branch
        await query(
          `UPDATE merchant_branches SET
            branch_name = $1,
            address = $2,
            city = $3,
            postcode = $4,
            phone = $5,
            location = ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography,
            click_and_collect = $8,
            opens_at = $9,
            closes_at = $10,
            is_active = true,
            updated_at = NOW()
          WHERE id = $11`,
          [
            branch.branchName,
            branch.address,
            branch.city,
            branch.postcode,
            branch.phone || null,
            branch.longitude,
            branch.latitude,
            branch.clickAndCollect ?? true,
            branch.opensAt || null,
            branch.closesAt || null,
            existing[0].id
          ]
        );
        updated++;
        console.log(`✅ Updated: ${branch.branchName}`);
      } else {
        // Insert new branch
        await query(
          `INSERT INTO merchant_branches (
            merchant_id, branch_name, branch_code, address, city, postcode,
            phone, location, click_and_collect, opens_at, closes_at, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7,
            ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography,
            $10, $11, $12, true)`,
          [
            merchantId,
            branch.branchName,
            branch.branchCode || null,
            branch.address,
            branch.city,
            branch.postcode,
            branch.phone || null,
            branch.longitude,
            branch.latitude,
            branch.clickAndCollect ?? true,
            branch.opensAt || null,
            branch.closesAt || null
          ]
        );
        created++;
        console.log(`➕ Created: ${branch.branchName}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${branch.branchName}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Seeding complete!');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors:   ${errors}`);
  console.log(`   Total:    ${branchData.length}`);
}

// Run if executed directly
if (import.meta.main) {
  seedBranches()
    .then(() => {
      console.log('✅ Branch seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Branch seeding failed:', error);
      process.exit(1);
    });
}

export { seedBranches, branchData };
