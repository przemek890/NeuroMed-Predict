#!/bin/bash

TOKEN_DUCKDNS=$(grep 'duckdns_token' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')
DOMAIN=$(grep 'domain_name' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')
DOMAIN=$(echo "$DOMAIN" | sed 's~https://~~')

RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN_DUCKDNS&txt=&clear=true")

if [ "$RESPONSE" != "OK" ]; then
    echo "Failed to clear DuckDNS TXT record. Response: $RESPONSE"
    exit 1
fi

echo "DuckDNS TXT record cleared successfully."