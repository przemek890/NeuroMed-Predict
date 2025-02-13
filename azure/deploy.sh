#!/bin/bash

VIDEOS_DIR="videos"
LOGS_DIR="logs"
CONTAINER_NAME="test-container"
RESOURCE_GROUP="tests"

if [ ! -f terraform.tfvars ]; then
  echo "Error: terraform.tfvars file not found. Exiting."
  exit 1
fi

git clone https://github.com/przemek890/NeuroMed-Predict.git
mv terraform.tfvars NeuroMed-Predict/azure/terraform/
cd NeuroMed-Predict/azure

pushd terraform
SENDER_EMAIL=$(grep 'sender_email' terraform.tfvars | awk -F ' = ' '{print $2}' | tr -d '"')
EMAIL_PASSWORD=$(grep 'email_password' terraform.tfvars | awk -F ' = ' '{print $2}' | tr -d '"')
RECEIVER_EMAIL=$(grep 'receiver_email' terraform.tfvars | awk -F ' = ' '{print $2}' | tr -d '"')
SMTP_SERVER=$(grep 'smtp_server' terraform.tfvars | awk -F ' = ' '{print $2}' | tr -d '"')
STORAGE_ACCOUNT=$(grep 'test_storage_account_name' terraform.tfvars | awk -F ' = ' '{print $2}' | tr -d '"')


terraform init
terraform apply -auto-approve | tee ../deployment.log
popd

STATUS=$(az container show --name "$CONTAINER_NAME" --resource-group "$RESOURCE_GROUP" --query "instanceView.state" -o tsv)
while [[ "$STATUS" == "Running" ]]; do
  echo "Container is running... Checking again in 10 seconds. Current status: $STATUS"
  sleep 10
  STATUS=$(az container show --name "$CONTAINER_NAME" --resource-group "$RESOURCE_GROUP" --query "instanceView.state" -o tsv)
done
echo "Container ${CONTAINER_NAME} has finished running or has been terminated."

STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query "[0].value" -o tsv)

echo "Downloading videos from Azure file share..."
mkdir -p "$VIDEOS_DIR"
if ! az storage file download-batch --account-name "$STORAGE_ACCOUNT" --account-key "$STORAGE_KEY" --source "videos" --destination "$VIDEOS_DIR"; then
  echo "Error while downloading videos, but continuing with script..."
fi

echo "Downloading logs from Azure file share..."
mkdir -p "$LOGS_DIR"
if ! az storage file download-batch --account-name "$STORAGE_ACCOUNT" --account-key "$STORAGE_KEY" --source "logs" --destination "$LOGS_DIR"; then
  echo "Error while downloading logs, but continuing with script..."
fi

if [ -d "$VIDEOS_DIR" ]; then
  echo "Packing the videos directory into ${VIDEOS_DIR}.zip"
  if ! zip -r "${VIDEOS_DIR}.zip" "$VIDEOS_DIR"/*; then
    echo "Error while packing videos, but continuing with script..."
  fi
else
  echo "The directory $VIDEOS_DIR does not exist."
fi

find "${LOGS_DIR}/assets" -type f -name "*.js" -exec bash -c 'mv "$0" "${0%.js}.js.txt"' {} \;

if [ -d "$LOGS_DIR" ]; then
  echo "Packing the logs directory into ${LOGS_DIR}.zip"
  if ! zip -r "${LOGS_DIR}.zip" "$LOGS_DIR"/*; then
    echo "Error while packing logs, but continuing with script..."
  fi
else
  echo "The directory $LOGS_DIR does not exist."
fi

FILES_TO_SEND=("deployment.log" "${LOGS_DIR}.zip" "${VIDEOS_DIR}.zip")

if [ ${#FILES_TO_SEND[@]} -gt 0 ]; then
  python3 mailer.py "$SENDER_EMAIL" "$RECEIVER_EMAIL" "$EMAIL_PASSWORD" "$SMTP_SERVER" "${FILES_TO_SEND[@]}"
else
  echo "No files to send."
fi

az group delete --name "$RESOURCE_GROUP" --yes --no-wait
