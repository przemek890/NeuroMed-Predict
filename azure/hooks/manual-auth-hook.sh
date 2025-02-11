#!/bin/bash

TOKEN_DUCKDNS=$(grep 'duckdns_token' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')
WAIT_TIME=300
INTERVAL=5
DOMAIN=$(grep 'domain_name' ../terraform/terraform.tfvars | cut -d '=' -f 2 | tr -d ' "')
DOMAIN=$(echo "$DOMAIN" | sed 's~https://~~')
LOGFILE="/tmp/certbot_output.log"
MAX_RETRIES=3
CURL_TIMEOUT=10

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

check_dns_propagation() {
    local expected_value="$1"
    local dig_result=$(dig +short -t TXT "_acme-challenge.$DOMAIN" @8.8.8.8)
    if [[ "$dig_result" == *"$expected_value"* ]]; then
        return 0
    else
        return 1
    fi
}

RECORD_NAME="_acme-challenge.${CERTBOT_DOMAIN}"
VALUE="${CERTBOT_VALIDATION}"

log_message "RECORD_NAME: $RECORD_NAME"
log_message "VALUE: $VALUE"

if [ -z "$RECORD_NAME" ] || [ -z "$VALUE" ]; then
    log_message "ERROR: Failed to extract DNS challenge details from Certbot environment variables."
    exit 1
fi

log_message "Updating DNS record for $RECORD_NAME with value $VALUE"


for ((i=1; i<=MAX_RETRIES; i++)); do
    RESPONSE=$(curl -s -m "$CURL_TIMEOUT" "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN_DUCKDNS&txt=$VALUE")
    if [ "$RESPONSE" == "OK" ]; then
        log_message "DNS record updated successfully."
        break
    else
        log_message "WARNING: Failed to update DuckDNS record. Response: $RESPONSE. Attempt $i of $MAX_RETRIES."
        if [ $i -eq $MAX_RETRIES ]; then
            log_message "ERROR: Failed to update DuckDNS record after $MAX_RETRIES attempts."
            exit 1
        fi
        sleep 5
    fi
done

log_message "Waiting for DNS propagation..."

SECONDS_LEFT=$WAIT_TIME
while [ $SECONDS_LEFT -gt 0 ]; do
    if check_dns_propagation "$VALUE"; then
        log_message "DNS propagation confirmed. TXT record is set correctly."
        exit 0
    fi
    log_message "Time remaining for DNS propagation: $SECONDS_LEFT seconds"
    sleep $INTERVAL
    SECONDS_LEFT=$((SECONDS_LEFT - INTERVAL))
done

log_message "ERROR: DNS propagation timeout. TXT record not found or not set correctly."
log_message "Current TXT record: $(dig +short -t TXT "_acme-challenge.$DOMAIN" @8.8.8.8)"
exit 1