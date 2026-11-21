// ESP32 clasico. Modulo de reles compatible con logica 3.3 V, activo en LOW.
// Bomba IN1=P23, cooler 1 IN2=P25, cooler 2 IN4=P26. IN3 libre.
// Abrir http://192.168.4.1 tras conectarse a la red indicada en el monitor serie.
#include <WiFi.h>
#include <WebServer.h>
#include "panel.h"

const char* AP_SSID = "Invernadero-Prueba";
const char* AP_PASSWORD = "Prueba2026";
constexpr uint8_t RELAY_PINS[] = {23, 25, 26};
constexpr uint8_t RELAY_CHANNELS[] = {1, 2, 4};
constexpr uint32_t PUMP_PULSE_MS = 2000;
bool enabled[] = {false, false, false};
uint32_t pumpStartedAt = 0;
WebServer server(80);

void setRelay(unsigned channel, bool on) {
  digitalWrite(RELAY_PINS[channel], on ? LOW : HIGH);
  enabled[channel] = on;
  if (channel == 0 && on) pumpStartedAt = millis();
  Serial.printf("Rele %u (P%u): %s\n", RELAY_CHANNELS[channel], RELAY_PINS[channel], on ? "ON" : "OFF");
}

void stopAll() {
  for (unsigned channel = 0; channel < 3; ++channel) setRelay(channel, false);
}

void expirePump() {
  if (enabled[0] && uint32_t(millis() - pumpStartedAt) >= PUMP_PULSE_MS) {
    setRelay(0, false);
  }
}

void sendStatus() {
  expirePump();
  String body = "{\"bomba\":";
  body += enabled[0] ? "true" : "false";
  body += ",\"cooler1\":";
  body += enabled[1] ? "true" : "false";
  body += ",\"cooler2\":";
  body += enabled[2] ? "true" : "false";
  body += "}";
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "application/json", body);
}

void handleRelay() {
  String channel = server.arg("canal");
  String action = server.arg("accion");
  if ((channel != "0" && channel != "1" && channel != "2") ||
      (action != "on" && action != "off")) {
    server.send(400, "text/plain", "Canal o accion invalida");
    return;
  }
  unsigned index = channel.toInt();
  // Una segunda orden ON durante el pulso no extiende su duracion.
  expirePump();
  if (index != 0 || action == "off" || !enabled[0]) {
    setRelay(index, action == "on");
  }
  sendStatus();
}

void setup() {
  for (uint8_t pin : RELAY_PINS) {
    digitalWrite(pin, HIGH);
    pinMode(pin, OUTPUT);
  }
  Serial.begin(115200);
  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(AP_SSID, AP_PASSWORD)) {
    Serial.println("Fallo al crear WiFi. Salidas apagadas. Reinicia el ESP32.");
    while (true) delay(1000);
  }
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Cache-Control", "no-store");
    server.send_P(200, "text/html; charset=utf-8", PANEL_HTML);
  });
  server.on("/estado", HTTP_GET, sendStatus);
  server.on("/rele", HTTP_POST, handleRelay);
  server.on("/apagar", HTTP_POST, []() { stopAll(); sendStatus(); });
  server.onNotFound([]() { server.send(404, "text/plain", "Ruta no encontrada"); });
  server.begin();
  Serial.printf("WiFi: %s\nClave: %s\n", AP_SSID, AP_PASSWORD);
  Serial.print("Panel: http://");
  Serial.println(WiFi.softAPIP());
  Serial.println("X = apagar todo. Bomba: pulsos de 2 s. Coolers: encendido manual.");
}

void loop() {
  expirePump();
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'X' || command == 'x') stopAll();
  }
  // Al perder todos los clientes WiFi se apagan las tres salidas.
  if (WiFi.softAPgetStationNum() == 0 && (enabled[0] || enabled[1] || enabled[2])) {
    stopAll();
  }
  server.handleClient();
  expirePump();
  delay(1);
}
