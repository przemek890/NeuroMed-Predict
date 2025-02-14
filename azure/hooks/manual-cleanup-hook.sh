#!/bin/bash

TOKEN_DUCKDNS=<<<YOUR_DUCKDNS_TOKEN>>>
DOMAIN=<<<YOUR_DUCKDNS_DOMAIN>>>

RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN_DUCKDNS&txt=&clear=true")

if [ "$RESPONSE" != "OK" ]; then
    echo "Failed to clear DuckDNS TXT record. Response: $RESPONSE"
    exit 1
fi

echo "DuckDNS TXT record cleared successfully."