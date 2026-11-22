// ESP32 clasico (ESP32-WROOM-32). No requiere bibliotecas adicionales.
// Cableado: 3V3 -- LDR --+-- resistencia 10 kohm -- GND
//                      +-- GPIO34
#include <WiFi.h>
#include <HTTPClient.h>

#if !defined(CONFIG_IDF_TARGET_ESP32)
#error "Selecciona ESP32 Dev Module para un ESP32 clasico; revisa el modelo de tu placa."
#endif

// Completa estos tres valores antes de subir el programa.
const char* WIFI_SSID = "TU_NOMBRE_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";
const char* API_KEY = "TU_CLAVE_API";

const char* API_URL = "http://192.168.100.8:8000/api/esp32/lecturas";
const int DEVICE_ID = 26; // ESP32 Central, invernadero 3. No es el ID del invernadero.
const int LDR_PIN = 34;
const unsigned long SEND_INTERVAL_MS = 10000;
unsigned long lastSend = 0;
unsigned long lastReconnect = 0;
bool wasConnected = false;

int readLight() {
  unsigned long total = 0;
  for (int i = 0; i < 16; ++i) {
    total += analogRead(LDR_PIN);
    delay(2);
  }
  return (total + 8) / 16;
}

void sendLight(int light) {
  String payload = "{\"id_dispositivo\":" + String(DEVICE_ID)
    + ",\"luz_adc\":" + String(light) + ",\"simulado\":false}";
  WiFiClient client;
  HTTPClient http;
  http.setConnectTimeout(3000);
  http.setTimeout(5000);
  if (!http.begin(client, API_URL)) {
    Serial.println("No se pudo abrir la URL de la API.");
    return;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  int code = http.POST(payload);
  Serial.printf("LDR: %d / 4095 | HTTP: %d\n", light, code);
  if (code > 0) Serial.println(http.getString());
  else Serial.println(http.errorToString(code));
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(LDR_PIN, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(LDR_PIN, ADC_11db);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Conectando a WiFi 2.4 GHz...");
}

void loop() {
  unsigned long now = millis();
  if (WiFi.status() != WL_CONNECTED) {
    wasConnected = false;
    if (now - lastReconnect >= SEND_INTERVAL_MS) {
      lastReconnect = now;
      Serial.println("Sin WiFi. Revisa nombre, clave y red de 2.4 GHz.");
      WiFi.reconnect();
    }
    delay(20);
    return;
  }
  if (!wasConnected) {
    wasConnected = true;
    Serial.print("IP ESP32: ");
    Serial.println(WiFi.localIP());
    lastSend = now - SEND_INTERVAL_MS; // Enviar al conectar.
  }
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    sendLight(readLight());
  }
  delay(20);
}
