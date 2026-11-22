// Prueba de polaridad, exclusivamente SIN bomba ni bateria en COM/NO/NC.
// Alimentar el modulo segun sus especificaciones; IN debe admitir GPIO de 3.3 V.
// No hay WiFi ni telemetria en esta prueba.
const int RELAY_PIN = 23;

void setup() {
  Serial.begin(115200);
  digitalWrite(RELAY_PIN, HIGH);
  pinMode(RELAY_PIN, OUTPUT);
  Serial.println("PRUEBA P23. Rele desconectado: medir voltaje entre P23 y GND.");
  Serial.println("P23 = HIGH. Envia H o L desde el monitor serie.");
}

void loop() {
  if (!Serial.available()) return;
  char command = Serial.read();
  if (command == 'H' || command == 'h') {
    digitalWrite(RELAY_PIN, HIGH);
    Serial.println("P23 = HIGH. Esperado sin carga: aproximadamente 3.3 V.");
  } else if (command == 'L' || command == 'l') {
    digitalWrite(RELAY_PIN, LOW);
    Serial.println("P23 = LOW. Esperado sin carga: aproximadamente 0 V.");
  }
}
