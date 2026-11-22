// Prueba supervisada: P23, rele activo en LOW. Sin WiFi ni riego automatico.
// R: pulso de 2 segundos. X: apagado inmediato.
// Probar primero COM/NO sin carga. La orden no confirma flujo de agua.
const int RELAY_PIN = 23;
const unsigned long PULSE_MS = 2000;
bool running = false;
unsigned long startedAt = 0;

void stopPump() {
  digitalWrite(RELAY_PIN, HIGH);
  running = false;
  Serial.println("Orden: bomba APAGADA.");
}

void setup() {
  digitalWrite(RELAY_PIN, HIGH);
  pinMode(RELAY_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("P23 activo LOW. R = pulso 2 segundos; X = apagar.");
  Serial.println("Prueba supervisada. No hay arranque automatico.");
}

void loop() {
  if (running && millis() - startedAt >= PULSE_MS) stopPump();
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'X' || command == 'x') {
      stopPump();
    } else if ((command == 'R' || command == 'r') && !running) {
      startedAt = millis();
      running = true;
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Orden: bomba ENCENDIDA durante 2 segundos.");
    }
  }
}
