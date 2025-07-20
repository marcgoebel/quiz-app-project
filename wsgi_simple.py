#!/usr/bin/python3.9

# PythonAnywhere WSGI configuration file
# Vereinfachte Version für garantierte Funktionalität

import sys
import os

# Add your project directory to the Python path
path = '/home/marcgoebel/quiz-app-project'
if path not in sys.path:
    sys.path.insert(0, path)

# Add the backend directory to the path
backend_path = '/home/marcgoebel/quiz-app-project/backend'
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change to the backend directory
os.chdir('/home/marcgoebel/quiz-app-project/backend')

# Import your simplified FastAPI application
from main_simple import app

# This is what PythonAnywhere will use to serve your app
application = app