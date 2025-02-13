#!/bin/bash

TOKEN_DUCKDNS=$(grep 'duckdns_token' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')
DOMAIN=$(grep 'duckdns_domain' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')

RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN_DUCKDNS&txt=&clear=true")

if [ "$RESPONSE" != "OK" ]; then
    echo "Failed to clear DuckDNS TXT record. Response: $RESPONSE"
    exit 1
fi

echo "DuckDNS TXT record cleared successfully."