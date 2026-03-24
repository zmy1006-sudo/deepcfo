#!/usr/bin/env python3
"""DeepCFO demo static server."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HOST = "0.0.0.0"
PORT = 8000

if __name__ == "__main__":
    print(f"DeepCFO demo is running at http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler).serve_forever()
