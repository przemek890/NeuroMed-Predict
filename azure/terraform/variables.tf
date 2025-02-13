variable "groq_api_key" {
  description = "API Key for GROQ"
  type        = string
}

variable "groq_gpt_model" {
  description = "GPT model for GROQ"
  type        = string
}

variable "certificate_pfx" {
  description = "PFX certificate"
  type        = string
}

variable "ssl_certificate_password" {
  description = "PFX certificate password"
  type        = string
}
variable "ssl_key_base64" {
  description = "SSL key in Base64 encoding"
  type        = string
}

variable "ssl_cert_base64" {
  description = "SSL certificate in Base64 encoding"
  type        = string
}

variable "subscription_id" {
  description = "The subscription ID for Azure"
  type        = string
}
variable "frontend_image" {
  description = "Docker image for frontend"
  type        = string
}
variable "backend_image" {
  description = "Docker image for backend"
  type        = string
}
variable "location" {
  description = "Azure location"
  type        = string
}
variable "duckdns_token" {
  description = "Token API DuckDNS"
  type        = string
}
variable "duckdns_domain" {
  description = "DuckDNS domain"
  type        = string
}
variable "tests_image" {
  description = "Docker image for tests"
  type        = string
}
variable "test_storage_account_name" {
  description = "Storage account name for tests"
  type        = string
}
variable "sender_email" {
  description = "Sender email"
  type        = string
}
variable "email_password" {
  description = "Sender email password"
  type        = string
}
variable "receiver_email" {
  description = "Receiver email"
  type        = string
}
variable "smtp_server" {
  description = "SMTP server"
  type        = string
}
variable "SAS_expiry" {
  description = "SAS expiry"
  type        = string
}
variable "data_file" {
  description = "Data file"
  type        = string
}
variable "data_file_csv" {
  description = "Data file CSV"
  type        = string
}
