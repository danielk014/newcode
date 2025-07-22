#!/bin/bash

echo "=== SITE VERIFICATION SCRIPT ==="
echo "Testing if the site is actually working..."

# Start the dev server in background
cd "/Volumes/external/new code/script-psych-architect"
npm run dev > /tmp/vite-output.log 2>&1 &
SERVER_PID=$!

# Give it time to start
sleep 10

# Test the connection
echo "Testing connection to localhost:5173..."
if curl -s --connect-timeout 5 http://localhost:5173 > /tmp/site-test.html; then
    echo "✅ Site is responding!"
    echo "✅ HTML content received"
    
    # Check if our content is actually there
    if grep -q "Script Generator" /tmp/site-test.html; then
        echo "✅ Our content is loading correctly!"
        echo "✅ SITE IS FULLY FUNCTIONAL"
    else
        echo "❌ Wrong content - different app is loading"
        echo "First 200 chars of response:"
        head -c 200 /tmp/site-test.html
    fi
else
    echo "❌ Site is NOT responding"
    echo "❌ Connection failed"
fi

# Show server info
echo -e "\n=== SERVER INFO ==="
cat /tmp/vite-output.log | tail -10

echo -e "\n=== FINAL STATUS ==="
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Dev server is running (PID: $SERVER_PID)"
    echo "🌐 Access at: http://localhost:5173/"
else
    echo "❌ Dev server died"
fi