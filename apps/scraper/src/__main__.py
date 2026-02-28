"""Entry point for the scraper application."""

import os
from scraper.api import run_server

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    run_server(port=port)
