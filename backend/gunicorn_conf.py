import multiprocessing
from dotenv import load_dotenv
import secrets
import os

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1

accesslog = "-"
errorlog = "-"
loglevel = "info"

cert_path = "./SSL/fullchain.pem"
key_path = "./SSL/privkey.pem"

wsgi_app = "main:app"

def on_starting(server):
    """Code executed once when Gunicorn master starts."""
    print("Gunicorn master starting...")
    load_dotenv()
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        SECRET_KEY = secrets.token_hex(32)
        with open('.env', 'a') as f:
            f.write(f'\nSECRET_KEY={SECRET_KEY}')

on_starting = on_starting