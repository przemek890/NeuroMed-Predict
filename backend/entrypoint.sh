#!/bin/sh
set -e

has_ssl=true

if [ -n "$SSL_CERT_BASE64" ]; then
    echo "Decoding SSL certificate..."
    echo "$SSL_CERT_BASE64" | base64 -d > ./SSL/fullchain.pem
else
    echo "No SSL certificate (SSL_CERT_BASE64 variable is empty)."
    has_ssl=false
fi

if [ -n "$SSL_KEY_BASE64" ]; then
    echo "Decoding SSL key..."
    echo "$SSL_KEY_BASE64" | base64 -d > ./SSL/privkey.pem
else
    echo "No SSL key (SSL_KEY_BASE64 variable is empty)."
    has_ssl=false
fi

if [ "$has_ssl" = true ]; then
    echo "Starting Gunicorn with SSL..."
    exec /app/.venv/bin/python3 -m gunicorn --certfile="$CERT_FILE" --keyfile="$KEY_FILE" --config gunicorn_conf.py main:app
else
    echo "No SSL certificates found, starting without SSL..."
    exec /app/.venv/bin/python3 local.py
fi
