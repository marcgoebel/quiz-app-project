@echo off
echo Starting local development server...
echo Attempting to start server on port 8000...
echo If port 8000 is in use, please run the start-server.py script instead.
echo Press Ctrl+C to stop the server
cd "%~dp0"

:: Try to run the Python script first (it handles port conflicts)
python start-server.py

:: If Python script fails, fall back to simple http.server
if %ERRORLEVEL% NEQ 0 (
    echo Falling back to simple HTTP server...
    python -m http.server 8000
)