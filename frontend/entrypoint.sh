#!/bin/sh
set -e

if [ -n "$SSL_CERT_BASE64" ]; then
    echo "Decoding SSL certificate..."
    echo "$SSL_CERT_BASE64" | base64 -d > /SSL/fullchain.pem
else
    echo "No SSL certificate (SSL_CERT_BASE64) provided."
fi

if [ -n "$SSL_KEY_BASE64" ]; then
    echo "Decoding SSL key..."
    echo "$SSL_KEY_BASE64" | base64 -d > /SSL/privkey.pem
else
    echo "No SSL key (SSL_KEY_BASE64) provided."
fi

source ./runtime-env.sh

exec serve -s build --ssl-cert /SSL/fullchain.pem --ssl-key /SSL/privkey.pem
