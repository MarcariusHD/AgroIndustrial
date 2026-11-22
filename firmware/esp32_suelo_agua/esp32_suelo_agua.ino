#include <WiFi.h>
#include <DHT.h>
DHT dhtInterior(4, DHT22);
DHT dhtExterior(18, DHT22);
float temperatureInside = NAN, humidityInside = NAN;
float temperatureOutside = NAN, humidityOutside = NAN;
uint32_t lastClimate = 0;
#include <HTTPClient.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include "config.h"
#ifndef RAIN_WET_LEVEL
#define RAIN_WET_LEVEL LOW
#endif
constexpr int rainPin = 27;
constexpr int fan1Pin = 25; // IN2 del rele
constexpr int fan2Pin = 26; // IN4 del rele
bool fan1On = false, fan2On = false;
bool lastFan1 = false, lastFan2 = false;

#ifndef CAPACITIVE_CALIBRATED
#define CAPACITIVE_CALIBRATED 0
#endif
#ifndef SOIL2_DRY_ADC
#define SOIL2_DRY_ADC -1
#endif
#ifndef SOIL2_WET_ADC
#define SOIL2_WET_ADC -1
#endif
constexpr bool soilReady = CAPACITIVE_CALIBRATED &&
  SOIL2_DRY_ADC > 0 && SOIL2_DRY_ADC < 4095 &&
  SOIL2_WET_ADC > 0 && SOIL2_WET_ADC < 4095 &&
  SOIL2_DRY_ADC != SOIL2_WET_ADC;

#include "irrigation.h"
#include "irrigation_checks.h"

static_assert(SOIL_ANALOG && WATER_ANALOG && SOIL_CALIBRATED && WATER_CALIBRATED,
              "Automatizacion requiere ambos sensores AO calibrados");
static_assert(SOIL_PIN >= 32 && SOIL_PIN <= 39 && WATER_PIN >= 32 && WATER_PIN <= 39,
              "Sensores AO requieren ADC1");
static_assert(SOIL_DRY_ADC != SOIL_WET_ADC, "Calibracion de suelo invalida");
static_assert(RELAY_PIN == 23 && RELAY_ACTIVE_LEVEL == LOW, "Montaje probado: P23 activo LOW");
static_assert(IRRIGATION_START_PERCENT < IRRIGATION_STOP_PERCENT, "Umbrales invalidos");
static_assert(IRRIGATION_PULSE_MS > 0 && IRRIGATION_PULSE_MS <= 5000, "Pulso maximo 5 s");
static_assert(IRRIGATION_SOAK_MS >= 10000 && IRRIGATION_MAX_PULSES > 0, "Limites invalidos");

struct Snapshot {
  int soil, water, soil2;
  float temperatureInside, humidityInside, temperatureOutside, humidityOutside;
  bool rain;
  int rainLevel;
  float percent, percent2;
  bool present, pump, fan1, fan2;
  char state[32];
  uint32_t capturedAt;
};
QueueHandle_t readings;
Irrigation irrigation({IRRIGATION_START_PERCENT, IRRIGATION_STOP_PERCENT,
  IRRIGATION_PULSE_MS, IRRIGATION_SOAK_MS, 5000, IRRIGATION_MAX_PULSES});
bool waterPresent = false;
unsigned waterSamples = 0;
uint32_t lastSample = 0, lastSend = 0;
const char* lastState = "";
bool lastWater = false;

int averageADC(int pin) {
  unsigned long total = 0;
  for (int i = 0; i < 16; i++) total += analogRead(pin);
  return total / 16;
}

void networkTask(void*) {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  uint32_t lastConnect = millis();
  Snapshot sample;
  for (;;) {
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() - lastConnect >= 10000) {
        lastConnect = millis();
        Serial.println("Sin WiFi: control local activo; avisos web requieren conexion.");
        WiFi.reconnect();
      }
      vTaskDelay(pdMS_TO_TICKS(100));
      continue;
    }
    if (xQueueReceive(readings, &sample, pdMS_TO_TICKS(100)) != pdTRUE) continue;
    if (uint32_t(millis() - sample.capturedAt) > 15000) continue;
    String body = "{\"id_dispositivo\":" + String(DEVICE_ID) + ",\"simulado\":false";
    if (isfinite(sample.temperatureInside)) body += ",\"temperatura\":" + String(sample.temperatureInside, 1);
    if (isfinite(sample.humidityInside)) body += ",\"humedad\":" + String(sample.humidityInside, 1);
    if (isfinite(sample.temperatureOutside)) body += ",\"temperatura_exterior\":" + String(sample.temperatureOutside, 1);
    if (isfinite(sample.humidityOutside)) body += ",\"humedad_exterior\":" + String(sample.humidityOutside, 1);
    body += ",\"suelo2_adc\":" + String(sample.soil2);
    body += String(",\"lluvia_detectada\":") + (sample.rain ? "true" : "false");
    body += ",\"suelo_adc\":" + String(sample.soil);
    // Recalibrar SOIL_DRY_ADC / SOIL_WET_ADC para el sensor capacitivo.
    if (soilReady) body += ",\"humedad_suelo\":" + String(sample.percent, 1);
    body += ",\"agua_adc\":" + String(sample.water);
    body += String(",\"agua_detectada\":") + (sample.present ? "true" : "false");
    body += String(",\"rele_activado\":") + (sample.pump ? "true" : "false");
    body += String(",\"ventilador1_activado\":") + (sample.fan1 ? "true" : "false");
    body += String(",\"ventilador2_activado\":") + (sample.fan2 ? "true" : "false");
    body += ",\"estado_riego\":\"" + String(sample.state) + "\"}";
    WiFiClient client;
    HTTPClient http;
    http.setConnectTimeout(2000);
    http.setTimeout(2000);
    if (!http.begin(client, API_URL)) { Serial.println("URL invalida"); continue; }
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY);
    int code = http.POST(body);
    Serial.println(body);
    Serial.printf("HTTP %d\n", code);
    if (code < 0) {
      Serial.printf("Wi-Fi: %s | IP ESP32: %s | Destino: %s | Error: %s\n",
        WiFi.SSID().c_str(), WiFi.localIP().toString().c_str(),
        API_URL, HTTPClient::errorToString(code).c_str());
    } else if (code != 201) {
      Serial.println(http.getString());
    }
    http.end();
  }
}

void setup() {
  digitalWrite(fan1Pin, HIGH);
  pinMode(fan1Pin, OUTPUT);
  digitalWrite(fan2Pin, HIGH);
  pinMode(fan2Pin, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);
  pinMode(RELAY_PIN, OUTPUT);
  Serial.begin(115200);
  dhtInterior.begin();
  dhtExterior.begin();
  pinMode(34, INPUT);
  pinMode(rainPin, INPUT);
  irrigation.pause(millis());
  pinMode(SOIL_PIN, INPUT);
  pinMode(WATER_PIN, INPUT);
  analogReadResolution(12);
  readings = xQueueCreate(12, sizeof(Snapshot));
  if (!readings || xTaskCreate(networkTask, "telemetry", 8192, nullptr, 1, nullptr) != pdPASS) {
    Serial.println("Fallo interno: bomba bloqueada. Reiniciar y revisar.");
    while (true) delay(1000);
  }
  Serial.println("Ventiladores manuales: 1 = alternar P25/IN2; 2 = alternar P26/IN4; X = apagar todo.");
  Serial.println("AUTOMATICO P23. X = pausar/apagar. A = rearmar (espera configurada).");
  Serial.println("Sin agua -> bloqueo. Riego limitado por ciclo seco.");
}

void loop() {
  uint32_t now = millis();
  if (Serial.available()) {
    char command = Serial.read();
    if (command == '1') {
      fan1On = !fan1On;
      digitalWrite(fan1Pin, fan1On ? LOW : HIGH);
    } else if (command == '2') {
      fan2On = !fan2On;
      digitalWrite(fan2Pin, fan2On ? LOW : HIGH);
    } else if (command == 'X' || command == 'x') {
      fan1On = fan2On = false;
      digitalWrite(fan1Pin, HIGH);
      digitalWrite(fan2Pin, HIGH);
      irrigation.pause(now);
      digitalWrite(RELAY_PIN, HIGH);
    } else if (command == 'A' || command == 'a') {
      if (soilReady && RELAY_CONNECTED) irrigation.arm(now);
      else Serial.println("Riego pausado: calibra ambos sensores y verifica RELAY_CONNECTED.");
    }
  }
  if (uint32_t(now - lastSample) < 100) { delay(1); return; }
  lastSample = now;
  if (!irrigation.pump && uint32_t(now - lastClimate) >= 2500) {
    temperatureInside = dhtInterior.readTemperature();
    humidityInside = dhtInterior.readHumidity();
    temperatureOutside = dhtExterior.readTemperature();
    humidityOutside = dhtExterior.readHumidity();
    lastClimate = millis();
    now = millis();
  }
  Snapshot sample{};
  sample.soil2 = averageADC(34);
  sample.rainLevel = digitalRead(rainPin);
  sample.rain = sample.rainLevel == RAIN_WET_LEVEL;
  sample.temperatureInside = temperatureInside;
  sample.humidityInside = humidityInside;
  sample.temperatureOutside = temperatureOutside;
  sample.humidityOutside = humidityOutside;
  sample.soil = averageADC(SOIL_PIN);
  sample.water = averageADC(WATER_PIN);
  sample.percent = constrain(100.0f * (sample.soil - SOIL_DRY_ADC) /
                             (SOIL_WET_ADC - SOIL_DRY_ADC), 0.0f, 100.0f);
  sample.percent2 = soilReady
    ? constrain(100.0f * (sample.soil2 - SOIL2_DRY_ADC) /
                float(SOIL2_WET_ADC - SOIL2_DRY_ADC), 0.0f, 100.0f)
    : NAN;
  bool enterWater = WATER_WET_IS_LOW ? sample.water < WATER_THRESHOLD_ADC - 200
                                   : sample.water > WATER_THRESHOLD_ADC + 200;
  bool exitWater = WATER_WET_IS_LOW ? sample.water >= WATER_THRESHOLD_ADC + 200
                                  : sample.water <= WATER_THRESHOLD_ADC - 200;
  if (exitWater) { waterPresent = false; waterSamples = 0; }
  else if (!waterPresent) {
    waterSamples = enterWater ? waterSamples + 1 : 0;
    if (waterSamples >= 3) waterPresent = true;
  }
  bool validSoil = sample.soil > 0 && sample.soil < 4095 && sample.soil2 > 0 && sample.soil2 < 4095;
  if (!RELAY_CONNECTED) irrigation.pause(now);
  irrigation.update(now, min(sample.percent, sample.percent2), validSoil, waterPresent);
  digitalWrite(RELAY_PIN, irrigation.pump ? LOW : HIGH);
  sample.present = waterPresent;
  sample.pump = irrigation.pump;
  sample.fan1 = fan1On;
  sample.fan2 = fan2On;
  snprintf(sample.state, sizeof(sample.state), "%s", irrigation.state);
  sample.capturedAt = millis();
  if (strcmp(lastState, irrigation.state) != 0 || lastWater != waterPresent ||
      lastFan1 != fan1On || lastFan2 != fan2On ||
      uint32_t(now - lastSend) >= 10000) {
    Serial.printf("Suelo 1: %d ADC | Suelo 2: %d ADC | Tanque: %d ADC (%s) | Lluvia: %s (DO=%s)\n",
      sample.soil, sample.soil2, sample.water, sample.present ? "agua" : "sin agua",
      sample.rain ? "si" : "no", sample.rainLevel == HIGH ? "HIGH" : "LOW");
    if (soilReady) Serial.printf("Suelo 1: %.1f %% | Suelo 2: %.1f %%\n", sample.percent, sample.percent2);
    Serial.printf("Interior: %.1f C / %.1f %% | Exterior: %.1f C / %.1f %% | Bomba: %s (%s)\n",
      sample.temperatureInside, sample.humidityInside, sample.temperatureOutside,
      sample.humidityOutside, sample.pump ? "ON" : "OFF", sample.state);
    if (xQueueSend(readings, &sample, 0) != pdTRUE) {
      Snapshot dropped;
      xQueueReceive(readings, &dropped, 0);
      xQueueSend(readings, &sample, 0);
    }
    Serial.printf("Ventilador 1: %s | Ventilador 2: %s\n", fan1On ? "ON" : "OFF", fan2On ? "ON" : "OFF");
    lastFan1 = fan1On;
    lastFan2 = fan2On;
    lastSend = now;
    lastState = irrigation.state;
    lastWater = waterPresent;
  }
}
