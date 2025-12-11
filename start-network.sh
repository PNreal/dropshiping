#!/bin/bash

echo "========================================"
echo "  DHL Shipping - Network Access Mode"
echo "========================================"
echo ""

echo "[1/2] Starting Backend Server..."
cd backend && npm start &
BACKEND_PID=$!
sleep 3

echo "[2/2] Starting Frontend Server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!
sleep 2

echo ""
echo "========================================"
echo "  Servers are starting..."
echo "========================================"
echo ""
echo "Check the console for IP addresses"
echo "Người khác có thể truy cập bằng địa chỉ Network IP"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

