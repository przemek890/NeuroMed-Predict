#!/bin/sh
set -e

has_ssl=true

if [ -n "$SSL_CERT_BASE64" ]; then
    echo "Decoding SSL certificate..."
    echo "$SSL_CERT_BASE64" | base64 -d > /SSL/fullchain.pem
else
    echo "No SSL certificate (SSL_CERT_BASE64) provided."
    has_ssl=false
fi

if [ -n "$SSL_KEY_BASE64" ]; then
    echo "Decoding SSL key..."
    echo "$SSL_KEY_BASE64" | base64 -d > /SSL/privkey.pem
else
    echo "No SSL key (SSL_KEY_BASE64) provided."
    has_ssl=false
fi

source ./runtime-env.sh

if [ "$has_ssl" = true ]; then
    echo "Starting app with SSL..."
    exec serve -s build --ssl-cert "$CERT_FILE" --ssl-key "$KEY_FILE"
else
    echo "No SSL certificates found, starting without SSL..."
    exec serve -s build
fi
