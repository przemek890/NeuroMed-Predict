provider "azurerm" {
  features {}
  use_msi = true
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "frontend" {
  name     = "frontend"
  location = var.location
}

resource "azurerm_resource_group" "backend" {
  name     = "backend"
  location = var.location
}

resource "azurerm_resource_group" "gateway" {
  name     = "gateway"
  location = var.location
}

resource "azurerm_virtual_network" "frontend_vnet" {
  name                = "frontendVnet"
  location            = azurerm_resource_group.frontend.location
  resource_group_name = azurerm_resource_group.frontend.name
  address_space       = ["10.1.0.0/16"]
}

resource "azurerm_virtual_network" "backend_vnet" {
  name                = "backendVnet"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_virtual_network" "gateway_vnet" {
  name                = "gatewayVnet"
  location            = azurerm_resource_group.gateway.location
  resource_group_name = azurerm_resource_group.gateway.name
  address_space       = ["10.2.0.0/16"]
}

resource "azurerm_subnet" "frontend_subnet" {
  name                 = "frontendSubnet"
  resource_group_name  = azurerm_resource_group.frontend.name
  virtual_network_name = azurerm_virtual_network.frontend_vnet.name
  address_prefixes     = ["10.1.1.0/24"]

  delegation {
    name = "aci_delegation"
    service_delegation {
      name    = "Microsoft.ContainerInstance/containerGroups"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "backend_subnet" {
  name                 = "backendSubnet"
  resource_group_name  = azurerm_resource_group.backend.name
  virtual_network_name = azurerm_virtual_network.backend_vnet.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "aci_delegation"
    service_delegation {
      name    = "Microsoft.ContainerInstance/containerGroups"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "app_gateway_subnet" {
  name                 = "AppGatewaySubnet"
  resource_group_name  = azurerm_resource_group.gateway.name
  virtual_network_name = azurerm_virtual_network.gateway_vnet.name
  address_prefixes     = ["10.2.1.0/24"]
}

resource "azurerm_public_ip" "gateway_ip" {
  name                = "gateway-ip"
  location            = azurerm_resource_group.gateway.location
  resource_group_name = azurerm_resource_group.gateway.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_application_gateway" "app_gateway" {
  name                = "app-gateway"
  location            = azurerm_resource_group.gateway.location
  resource_group_name = azurerm_resource_group.gateway.name

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "gateway-ip-configuration"
    subnet_id = azurerm_subnet.app_gateway_subnet.id
  }

  frontend_port {
    name = "https-port"
    port = 443
  }

  frontend_port {
    name = "backend-port"
    port = 5000
  }

  frontend_ip_configuration {
    name                 = "frontend-ip-configuration"
    public_ip_address_id = azurerm_public_ip.gateway_ip.id
  }

  backend_address_pool {
    name        = "frontend-address-pool"
    ip_addresses = [azurerm_container_group.frontend.ip_address]
  }

  backend_address_pool {
    name        = "backend-address-pool"
    ip_addresses = [azurerm_container_group.backend.ip_address]
  }

  backend_http_settings {
    name                        = "frontend-https-settings"
    cookie_based_affinity       = "Disabled"
    port                        = 3000
    protocol                    = "Https"
    request_timeout             = 10
    host_name                   = "${var.duckdns_domain}.duckdns.org"
  }

  backend_http_settings {
    name                        = "backend-https-settings"
    cookie_based_affinity       = "Disabled"
    port                        = 5000
    protocol                    = "Https"
    request_timeout             = 10
    host_name                   = "${var.duckdns_domain}.duckdns.org"
  }

  http_listener {
    name                           = "https-listener-frontend"
    frontend_ip_configuration_name = "frontend-ip-configuration"
    frontend_port_name             = "https-port"
    protocol                       = "Https"
    ssl_certificate_name           = "gateway-cert"
  }

  http_listener {
    name                           = "https-listener-backend"
    frontend_ip_configuration_name = "frontend-ip-configuration"
    frontend_port_name             = "backend-port"
    protocol                       = "Https"
    ssl_certificate_name           = "gateway-cert"
  }

  request_routing_rule {
    name                       = "frontend-https-routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "https-listener-frontend"
    backend_address_pool_name  = "frontend-address-pool"
    backend_http_settings_name = "frontend-https-settings"
    priority                   = 100
  }

  request_routing_rule {
    name                       = "backend-routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "https-listener-backend"
    backend_address_pool_name  = "backend-address-pool"
    backend_http_settings_name = "backend-https-settings"
    priority                   = 200
  }

  probe {
    name                = "https-probe"
    protocol            = "Https"
    path                = "/"
    interval            = 30
    timeout             = 120
    unhealthy_threshold = 3
    pick_host_name_from_backend_http_settings = true
  }

  ssl_certificate {
    name     = "gateway-cert"
    data     =  var.certificate_pfx
    password =  var.ssl_certificate_password
  }

  depends_on = [
    azurerm_container_group.frontend,
    azurerm_container_group.backend
  ]
}

resource "azurerm_virtual_network_peering" "frontend_to_backend" {
  name                      = "frontendToBackend"
  resource_group_name       = azurerm_resource_group.frontend.name
  virtual_network_name      = azurerm_virtual_network.frontend_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.backend_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "backend_to_frontend" {
  name                      = "backendToFrontend"
  resource_group_name       = azurerm_resource_group.backend.name
  virtual_network_name      = azurerm_virtual_network.backend_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.frontend_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "frontend_to_gateway" {
  name                      = "frontendToGateway"
  resource_group_name       = azurerm_resource_group.frontend.name
  virtual_network_name      = azurerm_virtual_network.frontend_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.gateway_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "gateway_to_frontend" {
  name                      = "gatewayToFrontend"
  resource_group_name       = azurerm_resource_group.gateway.name
  virtual_network_name      = azurerm_virtual_network.gateway_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.frontend_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "backend_to_gateway" {
  name                      = "backendToGateway"
  resource_group_name       = azurerm_resource_group.backend.name
  virtual_network_name      = azurerm_virtual_network.backend_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.gateway_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "gateway_to_backend" {
  name                      = "gatewayToBackend"
  resource_group_name       = azurerm_resource_group.gateway.name
  virtual_network_name      = azurerm_virtual_network.gateway_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.backend_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_network_security_group" "frontend_nsg" {
  name                = "frontendNsg"
  location            = azurerm_resource_group.frontend.location
  resource_group_name = azurerm_resource_group.frontend.name

  security_rule {
    name                       = "AllowAppGatewayToFrontend"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000"
    source_address_prefix      = "10.2.1.0/24"  # App Gateway subnet
    destination_address_prefix = "10.1.1.0/24"  # Frontend subnet
  }

  security_rule {
    name                       = "AllowFrontendToAppGateway"
    priority                   = 1001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.1.1.0/24"  # Frontend subnet
    destination_address_prefix = "10.2.1.0/24"  # App Gateway subnet
  }

  security_rule {
    name                       = "AllowFrontendToBackend"
    priority                   = 1002
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.1.1.0/24"  # Frontend subnet
    destination_address_prefix = "10.0.1.0/24"  # Backend subnet
  }

  security_rule {
    name                       = "AllowBackendToFrontend"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.0.1.0/24"  # Backend subnet
    destination_address_prefix = "10.1.1.0/24"  # Frontend subnet
  }
}

resource "azurerm_network_security_group" "backend_nsg" {
  name                = "backendNsg"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name

  security_rule {
    name                       = "AllowAppGatewayToBackend"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.2.1.0/24"  # App Gateway subnet
    destination_address_prefix = "10.0.1.0/24"  # Backend subnet
  }

  security_rule {
    name                       = "AllowBackendToAppGateway"
    priority                   = 1001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.0.1.0/24"  # Backend subnet
    destination_address_prefix = "10.2.1.0/24"  # App Gateway subnet
  }

  security_rule {
    name                       = "AllowBackendToFrontend"
    priority                   = 1002
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000"
    source_address_prefix      = "10.0.1.0/24"  # Backend subnet
    destination_address_prefix = "10.1.1.0/24"  # Frontend subnet
  }

  security_rule {
    name                       = "AllowFrontendToBackendInbound"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "10.1.1.0/24"  # Frontend subnet
    destination_address_prefix = "10.0.1.0/24"  # Backend subnet
  }
}

resource "azurerm_subnet_network_security_group_association" "frontend_subnet_association" {
  subnet_id                 = azurerm_subnet.frontend_subnet.id
  network_security_group_id = azurerm_network_security_group.frontend_nsg.id
}

resource "azurerm_subnet_network_security_group_association" "backend_subnet_association" {
  subnet_id                 = azurerm_subnet.backend_subnet.id
  network_security_group_id = azurerm_network_security_group.backend_nsg.id
}

resource "azurerm_cosmosdb_account" "mongo" {
  name                = "medical-cosmosdb"
  resource_group_name = azurerm_resource_group.backend.name
  location            = azurerm_resource_group.backend.location
  offer_type          = "Standard"
  kind                = "MongoDB"

  consistency_policy {
    consistency_level = "Session"
  }

  capabilities {
    name = "EnableMongo"
  }

  geo_location {
    location          = azurerm_resource_group.backend.location
    failover_priority = 0
  }

  depends_on = [
    azurerm_virtual_network.backend_vnet,
    azurerm_subnet.backend_subnet,
    azurerm_network_security_group.backend_nsg
  ]
}

resource "azurerm_container_group" "backend" {
  name                = "medical-backend"
  location            = azurerm_resource_group.backend.location
  resource_group_name = azurerm_resource_group.backend.name
  os_type             = "Linux"
  ip_address_type     = "Private"
  restart_policy      = "Never"
  subnet_ids          = [azurerm_subnet.backend_subnet.id]

  container {
    name   = "medical-backend"
    image  = var.backend_image
    cpu    = 2
    memory = 4.0
    ports {
      port     = 5000
      protocol = "TCP"
    }

    environment_variables = {
      MONGO_CONNECTION_STRING = azurerm_cosmosdb_account.mongo.primary_mongodb_connection_string
      GROQ_API_KEY            = var.groq_api_key
      GROQ_GPT_MODEL          = var.groq_gpt_model
      REACT_APP_DOMAIN        = "https://${var.duckdns_domain}.duckdns.org"
      SSL_KEY_BASE64          = var.ssl_key_base64
      SSL_CERT_BASE64         = var.ssl_cert_base64
    }

  }

  tags = {
    environment = "production"
  }

    depends_on = [
    azurerm_cosmosdb_account.mongo
  ]
}

resource "azurerm_container_group" "frontend" {
  name                = "medical-frontend"
  location            = azurerm_resource_group.frontend.location
  resource_group_name = azurerm_resource_group.frontend.name
  os_type             = "Linux"
  ip_address_type     = "Private"
  restart_policy      = "Never"
  subnet_ids          = [azurerm_subnet.frontend_subnet.id]

  container {
    name   = "medical-frontend"
    image  = var.frontend_image
    cpu    = 2
    memory = 4.0
    ports {
      port     = 3000
      protocol = "TCP"
    }
    environment_variables = {
      REACT_APP_DOMAIN = "https://${var.duckdns_domain}.duckdns.org"
      SSL_KEY_BASE64   = var.ssl_key_base64
      SSL_CERT_BASE64  = var.ssl_cert_base64
    }
  }

  tags = {
    environment = "production"
  }

  depends_on = [
    azurerm_container_group.backend,
    azurerm_public_ip.gateway_ip
  ]
}

resource "null_resource" "duckdns_update" {
  triggers = {
    ip_address = azurerm_public_ip.gateway_ip.ip_address
  }

  provisioner "local-exec" {
    command = "curl --max-time 30 -k \"https://www.duckdns.org/update?domains=${var.duckdns_domain}&token=${var.duckdns_token}&clear=true\""
  }

  provisioner "local-exec" {
    command = "curl --max-time 30 -k \"https://www.duckdns.org/update?domains=${var.duckdns_domain}&token=${var.duckdns_token}&ip=${azurerm_public_ip.gateway_ip.ip_address}\""
  }
}


