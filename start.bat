@echo off
echo ========================================
echo  Blockchain Certificate Verification
echo ========================================
echo.

echo Starting MongoDB (Docker)...
docker run -d -p 27017:27017 --name mongodb mongo:latest 2>nul
if %errorlevel% neq 0 (
    echo MongoDB container already exists or Docker not available
    echo Please ensure MongoDB is running on port 27017
)

echo.
echo Starting Hardhat local blockchain...
start "Hardhat Network" cmd /k "cd smart-contracts && npx hardhat node"

echo.
echo Waiting for Hardhat network to start...
timeout /t 10 /nobreak >nul

echo.
echo Deploying smart contracts...
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
cd ..

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend application...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Demo Accounts:
echo Admin:      admin@demo.com / password123
echo Institution: institution@demo.com / password123
echo Student:    student@demo.com / password123
echo Verifier:   verifier@demo.com / password123
echo.
echo Press any key to exit...
pause >nul