#!/usr/bin/env node

/**
 * Test script to verify development authentication bypass
 * This script tests if the DEV_BYPASS_AUTH feature is working correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAuthBypass() {
    console.log('🧪 Testing Development Authentication Bypass\n');

    try {
        // Test accessing a protected endpoint without authentication
        console.log('Testing access to /api/ponds without authentication...');

        const response = await axios.get(`${API_BASE_URL}/ponds`, {
            timeout: 5000
        });

        if (response.status === 200) {
            console.log('✅ SUCCESS: Authentication bypass is working!');
            console.log(`   Response status: ${response.status}`);
            console.log(`   Data type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
        } else {
            console.log(`⚠️  Unexpected status: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            console.log(`❌ FAILED: Server responded with status ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.message || 'No message'}`);
        } else if (error.request) {
            console.log('❌ FAILED: No response received from server');
            console.log('   Please make sure the server is running');
        } else {
            console.log(`❌ FAILED: ${error.message}`);
        }
    }

    console.log('\n📋 To enable authentication bypass in development:');
    console.log('1. Make sure NODE_ENV=development in your server .env file');
    console.log('2. Set DEV_BYPASS_AUTH=true in your server .env file');
    console.log('3. Restart your server');
}

// Run the test
testAuthBypass().catch(console.error);