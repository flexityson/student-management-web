#!/usr/bin/env python3
"""
Simple HTTP server for StudentHub preview
Serves the src directory and handles routing
"""

import http.server
import socketserver
import os
import urllib.parse
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="src", **kwargs)
    
    def do_GET(self):
        # Parse the path
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path.lstrip('/')
        
        # Route handling
        if path == '' or path == '/':
            self.path = '/index.html'
        elif path == 'login':
            self.path = '/login.html'
        elif path == 'signup':
            self.path = '/signup.html'
        elif path.startswith('api/'):
            # API routes would need a separate backend
            self.send_response(501)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "API not available in preview mode"}')
            return
        
        # Set proper MIME types
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        
        return super().do_GET()
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

def run_server(port=3000):
    """Start the development server"""
    
    # Change to the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🚀 Starting StudentHub development server...")
    print(f"📁 Serving directory: {os.path.join(os.getcwd(), 'src')}")
    print(f"🌐 Server running at: http://localhost:{port}")
    print(f"📱 Main app: http://localhost:{port}/index.html")
    print(f"🔐 Login: http://localhost:{port}/login.html")
    print(f"📝 Signup: http://localhost:{port}/signup.html")
    print(f"⏹️  Press Ctrl+C to stop the server")
    
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Please try a different port.")
            print(f"💡 Try: python3 serve.py 3001")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    import sys
    
    port = 3000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 3000.")
    
    run_server(port)
