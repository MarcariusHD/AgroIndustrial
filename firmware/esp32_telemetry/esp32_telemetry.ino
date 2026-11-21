#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"
#if !SIMULATED_DATA
#include <DHT.h>
DHT dht(DHT_PIN, DHT22);
#endif

unsigned long lastSend = 0;
unsigned long lastConnect = 0;
const unsigned long interval = 10000;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
#if !SIMULATED_DATA
  dht.begin();
  analogReadResolution(12);
  pinMode(LDR_PIN, INPUT);
#endif
}

void loop() {
  unsigned long now = millis();
  if (WiFi.status() != WL_CONNECTED) {
    if (now - lastConnect >= interval) {
      lastConnect = now;
      Serial.println("Esperando WiFi / reconectando...");
      WiFi.reconnect();
    }
    delay(20);
    return;
  }
  if (now - lastSend < interval) { delay(20); return; }
  lastSend = now;
  float temperature, humidity;
  int light;
#if SIMULATED_DATA
  temperature = random(200, 301) / 10.0f;
  humidity = random(450, 751) / 10.0f;
  light = random(500, 3501);
#else
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  light = analogRead(LDR_PIN);
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error DHT22: no se envia esta muestra.");
    return;
  }
#endif
  String payload = "{\"id_dispositivo\":" + String(DEVICE_ID)
    + ",\"temperatura\":" + String(temperature, 1)
    + ",\"humedad\":" + String(humidity, 1)
    + ",\"luz_adc\":" + String(light)
    + ",\"simulado\":" + String(SIMULATED_DATA ? "true" : "false") + "}";
  WiFiClient client;
  HTTPClient http;
  http.setConnectTimeout(3000);
  http.setTimeout(5000);
  if (!http.begin(client, API_URL)) { Serial.println("URL invalida"); return; }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  int code = http.POST(payload);
  Serial.print("IP ESP32: "); Serial.println(WiFi.localIP());
  Serial.printf("HTTP %d (%s)\n", code, SIMULATED_DATA ? "simulado" : "real");
  if (code > 0) Serial.println(http.getString());
  else Serial.println(http.errorToString(code));
  http.end();
  // Si falla, se toma una nueva muestra en el siguiente intervalo; no hay cola offline.
}
