import http.server
import socketserver
import os
import webbrowser
import socket
import sys

# Try different ports if the default one is in use
PORT = 8000
MAX_PORT = 8010  # Try ports 8000-8010

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If root path is requested, serve the index.html
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Change to the directory where this script is located
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = MyHttpRequestHandler

# Try to find an available port
server_started = False
for port in range(PORT, MAX_PORT + 1):
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"Server started at http://localhost:{port}")
            print("Opening browser automatically...")
            # Open the browser automatically
            webbrowser.open(f'http://localhost:{port}')
            print("Press Ctrl+C to stop the server")
            server_started = True
            httpd.serve_forever()
    except socket.error as e:
        print(f"Port {port} is already in use, trying next port...")

if not server_started:
    print(f"Could not find an available port in range {PORT}-{MAX_PORT}")
    print("Please close any running servers or try a different port range.")
    sys.exit(1)