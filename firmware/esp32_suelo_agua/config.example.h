#pragma once
#define WIFI_SSID "TU_WIFI_2_4_GHZ"
#define WIFI_PASSWORD "TU_PASSWORD"
#define API_URL "http://192.168.100.8:8000/api/esp32/lecturas"
#define API_KEY "MISMA_CLAVE_QUE_ESP32_API_KEY"
#define DEVICE_ID 26
#define SOIL_ANALOG 1
#define WATER_ANALOG 1
#define SOIL_PIN 33
#define WATER_PIN 32
// Referencias medidas en este montaje; recalibrar para otro sensor/suelo.
#define SOIL_CALIBRATED 1
#define SOIL_DRY_ADC 3950
#define SOIL_WET_ADC 2155
#define WATER_CALIBRATED 1
#define WATER_THRESHOLD_ADC 1000
#define WATER_WET_IS_LOW 0
// Copias nuevas: habilitar explicitamente tras verificar el rele sin bomba.
#define RELAY_CONNECTED 0
#define RELAY_PIN 23
#define RELAY_ACTIVE_LEVEL LOW
#define IRRIGATION_START_PERCENT 30
#define IRRIGATION_STOP_PERCENT 60
#define IRRIGATION_PULSE_MS 2000
#define IRRIGATION_SOAK_MS 30000
#define IRRIGATION_MAX_PULSES 3

// Reemplaza las referencias de SOIL_DRY_ADC y SOIL_WET_ADC para el capacitivo 1.
#define SOIL2_DRY_ADC -1
#define SOIL2_WET_ADC -1
#define CAPACITIVE_CALIBRATED 0
