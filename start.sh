#!/bin/bash

echo "========================================"
echo " Blockchain Certificate Verification"
echo "========================================"
echo

echo "Starting MongoDB (Docker)..."
docker run -d -p 27017:27017 --name mongodb mongo:latest 2>/dev/null || echo "MongoDB container already exists or Docker not available"

echo
echo "Starting Hardhat local blockchain..."
cd smart-contracts
gnome-terminal -- bash -c "npx hardhat node; exec bash" 2>/dev/null || \
xterm -e "npx hardhat node" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npx hardhat node"' 2>/dev/null || \
echo "Please manually run: cd smart-contracts && npx hardhat node"

echo
echo "Waiting for Hardhat network to start..."
sleep 10

echo
echo "Deploying smart contracts..."
npx hardhat run scripts/deploy.js --network localhost
cd ..

echo
echo "Starting backend server..."
gnome-terminal -- bash -c "cd backend && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd backend && npm run dev" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && npm run dev"' 2>/dev/null || \
echo "Please manually run: cd backend && npm run dev"

echo
echo "Waiting for backend to start..."
sleep 5

echo
echo "Starting frontend application..."
gnome-terminal -- bash -c "cd frontend && npm start; exec bash" 2>/dev/null || \
xterm -e "cd frontend && npm start" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/frontend && npm start"' 2>/dev/null || \
echo "Please manually run: cd frontend && npm start"

echo
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo
echo "Demo Accounts:"
echo "Admin:      admin@demo.com / password123"
echo "Institution: institution@demo.com / password123"
echo "Student:    student@demo.com / password123"
echo "Verifier:   verifier@demo.com / password123"
echo