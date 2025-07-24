#!/usr/bin/env python3
"""
Secure Pantheon Command Server
This server holds the command definitions in memory and provides them
to Claude Code without exposing the files directly.
"""

import os
import json
import hashlib
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

# Commands would be embedded here during build
COMMANDS = {}  # This would be populated during Docker build

class PantheonHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Verify request is from localhost only
        if self.client_address[0] not in ['127.0.0.1', 'localhost']:
            self.send_error(403, "Forbidden")
            return
            
        # Parse command request
        if self.path.startswith('/command/'):
            command_name = self.path[9:]
            if command_name in COMMANDS:
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(COMMANDS[command_name].encode())
            else:
                self.send_error(404, "Command not found")
        else:
            self.send_error(404, "Not found")

def load_commands(directory):
    """Load all command files into memory"""
    commands = {}
    cmd_path = Path(directory) / 'commands'
    if cmd_path.exists():
        for file in cmd_path.glob('*.md'):
            commands[file.stem] = file.read_text()
    return commands

if __name__ == '__main__':
    # Load commands from filesystem once at startup
    COMMANDS = load_commands('/opt/pantheon/.claude')
    
    # Start server on localhost only
    server = HTTPServer(('127.0.0.1', 8888), PantheonHandler)
    print("Pantheon Command Server running on port 8888")
    server.serve_forever()