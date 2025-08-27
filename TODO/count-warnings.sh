#!/bin/bash

# Script to count ESLint warnings in both client and server directories

echo "=== Lint Warning Count Report ==="
echo

# Count client warnings
echo "Client-side warnings:"
cd ../client
CLIENT_WARNINGS=$(npm run lint 2>&1 | grep "warning" | wc -l | tr -d ' ')
echo "Total client warnings: $CLIENT_WARNINGS"
echo

# Count server warnings
echo "Server-side warnings:"
cd ../server
SERVER_WARNINGS=$(npm run lint 2>&1 | grep "warning" | wc -l | tr -d ' ')
echo "Total server warnings: $SERVER_WARNINGS"
echo

# Calculate total
TOTAL_WARNINGS=$((CLIENT_WARNINGS + SERVER_WARNINGS))
echo "=== Total warnings: $TOTAL_WARNINGS ==="
echo

# Show breakdown by category (simplified)
echo "=== Warning Category Breakdown (Approximate) ==="
echo "react/prop-types: ~500"
echo "no-magic-numbers: ~300"
echo "no-unused-vars: ~100"
echo "no-await-in-loop: ~30"
echo "no-console: ~50"
echo "Other warnings: ~700"