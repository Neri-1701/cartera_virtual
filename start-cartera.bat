@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Dependencias no instaladas. Ejecuta: npm install
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm no esta instalado o no esta en PATH.
  echo Instala Node.js y vuelve a intentar.
  pause
  exit /b 1
)

REM Usa un puerto fijo para que el navegador abra bien
start "" http://localhost:5173
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort

endlocal
