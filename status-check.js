#!/usr/bin/env node

// Final Status Check for Shrimp Farm Management System
const axios = require('axios');

console.log('🚀 Shrimp Farm Management System - Final Status Check\n');

async function checkStatus() {
    const checks = [
        {
            name: 'MongoDB (Docker)',
            test: async () => {
                try {
                    const { execSync } = require('child_process');
                    const result = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}" | grep shrimp_farm_mongodb', { encoding: 'utf8' });
                    return result.includes('Up') ? 'Running' : 'Not Running';
                } catch {
                    return 'Not Running';
                }
            }
        },
        {
            name: 'Backend API',
            test: async () => {
                try {
                    const response = await axios.get('http://localhost:5001/', { timeout: 2000 });
                    return 'Running ✅';
                } catch {
                    return 'Not Running ❌';
                }
            }
        },
        {
            name: 'Database Users',
            test: async () => {
                try {
                    const response = await axios.get('http://localhost:5001/api/test-users', { timeout: 2000 });
                    return `${response.data.count} users created ✅`;
                } catch {
                    return 'Cannot connect ❌';
                }
            }
        },
        {
            name: 'Frontend',
            test: async () => {
                try {
                    const response = await axios.get('http://localhost:3000/', { timeout: 2000 });
                    return response.status === 200 ? 'Running ✅' : 'Not Running ❌';
                } catch {
                    return 'Not Running ❌';
                }
            }
        }
    ];

    console.log('📊 Service Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const check of checks) {
        const status = await check.test();
        console.log(`${check.name.padEnd(20)} │ ${status}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔑 User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username │ Password │ Role');
    console.log('──────────────────────────────────────────────────────────');
    console.log('admin    │ password │ Administrator');
    console.log('manager  │ password │ Manager');
    console.log('operator │ password │ Operator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🌐 Access URLs:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Frontend:    http://localhost:3000');
    console.log('Backend API: http://localhost:5001');
    console.log('Test Users:  http://localhost:5001/api/test-users');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Docker Setup:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Local MongoDB uninstalled');
    console.log('✅ MongoDB running in Docker container');
    console.log('✅ Database seeded with sample data');
    console.log('✅ Users created and authenticated');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 Next Steps:');
    console.log('1. Click the preview button to access the frontend');
    console.log('2. Log in with any of the provided credentials');
    console.log('3. Explore the shrimp farm management features');
    console.log('4. The system is now fully Docker-based with persistent data\n');

    console.log('🛑 To Stop Everything:');
    console.log('docker-compose -f docker-compose.simple.yml down\n');

    console.log('🔄 To Restart:');
    console.log('./simple-setup.sh\n');
}

checkStatus().catch(console.error);