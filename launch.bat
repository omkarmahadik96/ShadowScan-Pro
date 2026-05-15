@echo off
setlocal
echo 🕵️ INITIALIZING SHADOWSCAN PRO TACTICAL SUITE...

echo [0/4] CLEANING UP STALE UPLINKS...
:: Kill processes on port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
:: Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [1/4] SYNCHRONIZING BACKEND DATA...
cd backend
start /b npm run dev

echo [2/4] WARMING UP COMMAND CORE...
timeout /t 5 /nobreak >nul

echo [3/4] DEPLOYING FRONTEND INTERFACE...
cd ../frontend
start /b npm run dev

echo [4/4] STATION OPERATIONAL. UPLINK ESTABLISHED.
echo --------------------------------------------------
echo [!] ACCESS WORKSTATION AT: http://localhost:3000
echo --------------------------------------------------
pause
