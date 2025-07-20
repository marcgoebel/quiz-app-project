#!/usr/bin/python3.9

# PythonAnywhere WSGI configuration file
# This file tells PythonAnywhere how to serve your FastAPI application

import sys
import os

# Add your project directory to the Python path
path = '/home/marcgoebel/quiz-app-project'  # Updated to correct username and project name
if path not in sys.path:
    sys.path.insert(0, path)

# Add the backend directory to the path
backend_path = '/home/marcgoebel/quiz-app-project/backend'  # Updated to correct username and project name
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change to the backend directory
os.chdir('/home/marcgoebel/quiz-app-project/backend')

# Import your FastAPI application
from main import app

# This is what PythonAnywhere will use to serve your app
application = app