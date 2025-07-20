#!/usr/bin/python3.11

# PythonAnywhere WSGI configuration file
# This file tells PythonAnywhere how to serve your FastAPI application

import sys
import os

# Add your project directory to the Python path
path = '/home/yourusername/quiz-app'  # Change 'yourusername' to your actual PythonAnywhere username
if path not in sys.path:
    sys.path.insert(0, path)

# Add the backend directory to the path
backend_path = '/home/yourusername/quiz-app/backend'  # Change 'yourusername' to your actual username
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change to the backend directory
os.chdir(backend_path)

# Import your FastAPI application
from main import app

# This is what PythonAnywhere will use to serve your app
application = app