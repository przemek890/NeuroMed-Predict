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

if [ "$has_ssl" = true ]; then
    source ./runtime-env.sh
    exec serve -s build --ssl-cert /SSL/fullchain.pem --ssl-key /SSL/privkey.pem
else
    echo "No SSL certificates found, starting without SSL..."
    exec serve -s build
fi
