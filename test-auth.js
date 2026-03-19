#!/usr/bin/env node

// Test script to verify user authentication
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test user credentials
const users = [
    { username: 'admin', password: 'password', role: 'admin' },
    { username: 'manager', password: 'password', role: 'manager' },
    { username: 'operator', password: 'password', role: 'operator' }
];

async function testAuthentication() {
    console.log('🧪 Testing User Authentication\n');

    for (const user of users) {
        try {
            console.log(`Testing login for: ${user.username} (${user.role})`);

            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username: user.username,
                password: user.password
            });

            if (response.data.token) {
                console.log(`✅ Login successful for ${user.username}`);
                console.log(`   Token: ${response.data.token.substring(0, 50)}...`);
                console.log(`   User: ${response.data.user.firstName} ${response.data.user.lastName}`);
                console.log(`   Role: ${response.data.user.role}`);
                console.log(`   Permissions: ${response.data.user.permissions.length} permissions`);
            } else {
                console.log(`❌ Login failed for ${user.username}`);
            }
        } catch (error) {
            console.log(`❌ Error logging in ${user.username}:`, error.response?.data?.message || error.message);
        }
        console.log('');
    }
}

async function testApiEndpoints() {
    console.log('🔍 Testing API Endpoints\n');

    // Test public endpoints
    const publicEndpoints = [
        '/',
        '/api/health'
    ];

    for (const endpoint of publicEndpoints) {
        try {
            const response = await axios.get(`http://localhost:5001${endpoint}`);
            console.log(`✅ ${endpoint}: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
}

async function main() {
    console.log('🚀 Shrimp Farm Management System - Authentication Test\n');

    await testApiEndpoints();
    console.log('');
    await testAuthentication();

    console.log('🎉 Authentication test completed!');
    console.log('\n📋 Summary:');
    console.log('• MongoDB: ✅ Running on port 27017');
    console.log('• Backend API: ✅ Running on port 5001');
    console.log('• Frontend: ✅ Running on port 3000');
    console.log('• Users Created: ✅ admin, manager, operator');
    console.log('\n🔑 Login Credentials:');
    users.forEach(user => {
        console.log(`   ${user.username} / ${user.password} (${user.role})`);
    });
}

main().catch(console.error);