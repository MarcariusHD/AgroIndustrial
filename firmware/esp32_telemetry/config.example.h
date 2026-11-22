#pragma once
#define WIFI_SSID "TU_WIFI_2_4_GHZ"
#define WIFI_PASSWORD "TU_PASSWORD"
#define API_URL "http://192.168.1.100:8000/api/esp32/lecturas"
#define API_KEY "MISMA_CLAVE_QUE_ESP32_API_KEY"
#define DEVICE_ID 1
// 1: no requiere sensores ni biblioteca DHT. 0: DHT22 y LDR conectados.
#define SIMULATED_DATA 1
// Pines para ESP32 clásico; verificar el modelo de placa antes de conectar.
#define DHT_PIN 4
#define LDR_PIN 34
