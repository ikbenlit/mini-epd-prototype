/**
 * ============================================================================
 * Seed Default Organization
 * ============================================================================
 * Epic: E3.S1 - Organization seed
 * Purpose: Create default GGZ organization for development
 * Usage: npx tsx scripts/seed-organization.ts
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface Organization {
  id: string;
  identifier_agb: string;
  identifier_kvk: string;
  name: string;
  alias: string[];
  type_code: string;
  type_display: string;
  telecom_phone: string;
  telecom_email: string;
  telecom_website: string;
  address_line: string[];
  address_city: string;
  address_postal_code: string;
  address_country: string;
  active: boolean;
}

const defaultOrganization: Organization = {
  id: '00000000-0000-0000-0000-000000000001',
  identifier_agb: 'AGB-DEMO-001',
  identifier_kvk: '12345678',
  name: 'Demo GGZ Instelling',
  alias: ['Demo GGZ', 'DGGZ'],
  type_code: 'prov',
  type_display: 'Healthcare Provider',
  telecom_phone: '030-1234567',
  telecom_email: 'info@demo-ggz.nl',
  telecom_website: 'https://demo-ggz.nl',
  address_line: ['Demonstratiestraat 1'],
  address_city: 'Utrecht',
  address_postal_code: '3511 AB',
  address_country: 'NL',
  active: true
};

async function seedOrganization() {
  console.log('🚀 Seeding default organization...\n');

  try {
    // Check if organization already exists
    const { data: existing, error: checkError } = await supabase
      .from('organizations')
      .select('id, name, identifier_agb')
      .eq('identifier_agb', 'AGB-DEMO-001')
      .maybeSingle();

    if (checkError) {
      throw new Error(`Error checking existing organization: ${checkError.message}`);
    }

    if (existing) {
      console.log('ℹ️  Organization already exists:');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   AGB: ${existing.identifier_agb}`);
      console.log('\n🔄 Updating organization...\n');

      // Update existing organization
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          identifier_kvk: defaultOrganization.identifier_kvk,
          name: defaultOrganization.name,
          alias: defaultOrganization.alias,
          type_code: defaultOrganization.type_code,
          type_display: defaultOrganization.type_display,
          telecom_phone: defaultOrganization.telecom_phone,
          telecom_email: defaultOrganization.telecom_email,
          telecom_website: defaultOrganization.telecom_website,
          address_line: defaultOrganization.address_line,
          address_city: defaultOrganization.address_city,
          address_postal_code: defaultOrganization.address_postal_code,
          address_country: defaultOrganization.address_country,
          active: defaultOrganization.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`Error updating organization: ${updateError.message}`);
      }

      console.log('✅ Organization updated successfully');
    } else {
      console.log('➕ Creating new organization...\n');

      // Insert new organization
      const { error: insertError } = await supabase
        .from('organizations')
        .insert([defaultOrganization]);

      if (insertError) {
        throw new Error(`Error inserting organization: ${insertError.message}`);
      }

      console.log('✅ Organization created successfully');
    }

    // Verify the organization exists
    const { data: verified, error: verifyError } = await supabase
      .from('organizations')
      .select('*')
      .eq('identifier_agb', 'AGB-DEMO-001')
      .single();

    if (verifyError) {
      throw new Error(`Error verifying organization: ${verifyError.message}`);
    }

    console.log('\n✅ Verification successful:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ID:           ${verified.id}`);
    console.log(`   Name:         ${verified.name}`);
    console.log(`   AGB:          ${verified.identifier_agb}`);
    console.log(`   KVK:          ${verified.identifier_kvk}`);
    console.log(`   Email:        ${verified.telecom_email}`);
    console.log(`   Website:      ${verified.telecom_website}`);
    console.log(`   Address:      ${verified.address_line.join(', ')}`);
    console.log(`   City:         ${verified.address_city} ${verified.address_postal_code}`);
    console.log(`   Active:       ${verified.active ? 'Yes' : 'No'}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 E3.S1 - Organization seed completed!\n');

  } catch (error) {
    console.error('\n❌ Error seeding organization:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the seed function
seedOrganization();
