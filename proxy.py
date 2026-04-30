"""Tiny CORS proxy for Kiwi Tequila — stdlib only.

Run: python3 proxy.py
Listens on http://127.0.0.1:8788
Browser calls /search?... with `apikey` header; proxy forwards to
api.tequila.kiwi.com/v2/search and returns the response with the
CORS header the browser needs.
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

KIWI_HOST = "https://api.tequila.kiwi.com"
PORT = int(os.environ.get("PORT", 8788))


class ProxyHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "apikey, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/search":
            self.send_response(404)
            self._cors()
            self.end_headers()
            self.wfile.write(b"only /search supported")
            return

        api_key = self.headers.get("apikey")
        if not api_key:
            self.send_response(400)
            self._cors()
            self.end_headers()
            self.wfile.write(b"missing apikey header")
            return

        upstream_url = f"{KIWI_HOST}/v2/search?{parsed.query}"
        req = Request(upstream_url, headers={"apikey": api_key})
        try:
            with urlopen(req, timeout=20) as resp:
                body = resp.read()
                self.send_response(resp.status)
                self._cors()
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.end_headers()
                self.wfile.write(body)
        except HTTPError as e:
            body = e.read()
            self.send_response(e.code)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        except URLError as e:
            self.send_response(502)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, fmt, *args):
        print(f"[proxy] {fmt % args}")


if __name__ == "__main__":
    print(f"[proxy] listening on http://127.0.0.1:{PORT}")
    HTTPServer(("127.0.0.1", PORT), ProxyHandler).serve_forever()
