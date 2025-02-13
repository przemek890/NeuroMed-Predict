resource "null_resource" "script_runner" {
  depends_on = [azurerm_application_gateway.app_gateway]

  triggers = {
    run_once = "initial_run"
  }

  provisioner "local-exec" {
    command = <<EOT
      pip install pymongo bson && \
      python3 ../upload_data.py $CONNECTION_STRING ../test_data/${var.data_file}
      python3 ../upload_data.py $CONNECTION_STRING ../test_data/${var.data_file_csv}
    EOT

    environment = {
      CONNECTION_STRING = azurerm_cosmosdb_account.mongo.primary_mongodb_connection_string
    }
  }
}

resource "azurerm_resource_group" "tests" {
  name     = "tests"
  location = var.location

  depends_on = [
    null_resource.script_runner
  ]
}

resource "azurerm_storage_account" "test_storage" {
  name                     = var.test_storage_account_name
  resource_group_name      = azurerm_resource_group.tests.name
  location                 = azurerm_resource_group.tests.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_share" "videos" {
  name                 = "videos"
  storage_account_id   = azurerm_storage_account.test_storage.id
  quota                = 1
}

resource "azurerm_storage_share" "logs" {
  name                 = "logs"
  storage_account_id   = azurerm_storage_account.test_storage.id
  quota                = 1
}

resource "azurerm_container_group" "test_container" {
  name                = "test-container"
  location            = azurerm_resource_group.tests.location
  resource_group_name = azurerm_resource_group.tests.name
  os_type             = "Linux"
  ip_address_type     = "Public"
  restart_policy      = "Never"

  container {
    name   = "tests"
    image  = var.tests_image
    cpu    = 2
    memory = 4.0

    environment_variables = {
      DOMAIN = "https://${var.duckdns_domain}.duckdns.org"
    }

    ports {
      port     = 80
      protocol = "TCP"
    }

    volume {
      name                 = "videos-volume"
      mount_path           = "/app/cypress/videos"
      read_only            = false
      storage_account_name = azurerm_storage_account.test_storage.name
      storage_account_key  = azurerm_storage_account.test_storage.primary_access_key
      share_name           = azurerm_storage_share.videos.name
    }

    volume {
      name                 = "logs-volume"
      mount_path           = "/app/cypress/logs"
      read_only            = false
      storage_account_name = azurerm_storage_account.test_storage.name
      storage_account_key  = azurerm_storage_account.test_storage.primary_access_key
      share_name           = azurerm_storage_share.logs.name
    }
  }

  tags = {
    environment = "tests"
  }
}
