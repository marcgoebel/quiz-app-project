# How to Start the Quiz App Server

This document provides instructions on how to start the local development server for the Quiz App.

## Option 1: Using the Batch File (Windows Only)

1. Double-click on the `start-server.bat` file in the root directory.
2. The server will attempt to start on port 8000.
3. Your default web browser should open automatically with the Quiz App loaded.
4. If port 8000 is already in use, the batch file will attempt to use the Python script instead.

## Option 2: Using the Python Script (Recommended, Works on All Platforms)

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command:
   ```
   python start-server.py
   ```
4. The script will try to find an available port starting from 8000.
5. Once a port is found, your default web browser will open automatically with the Quiz App loaded.
6. To stop the server, press Ctrl+C in the terminal.

## Option 3: Using Python's Built-in HTTP Server

1. Open a terminal or command prompt.
2. Navigate to the root directory of the project.
3. Run the following command:
   ```
   python -m http.server 8000
   ```
4. Open your web browser and go to http://localhost:8000
5. You should be automatically redirected to the Quiz App.

## Troubleshooting

- If you see a directory listing instead of the Quiz App, make sure you're accessing the root URL (http://localhost:8000) and not a subdirectory.
- If the server fails to start due to port conflicts, try using the Python script (Option 2) which will automatically find an available port.
- If you're still having issues, check if any other applications are using port 8000 and close them, or modify the PORT variable in the start-server.py file to use a different port range.