# Prueba ESP32 + LDR (invernadero 3)

Programa: `firmware/esp32_ldr/esp32_ldr.ino`.
Laptop: `192.168.100.8`; puerto: `8000`; dispositivo: `26` (ESP32 Central).
El firmware envía una lectura real cada 10 segundos a `/api/esp32/lecturas`.
No requiere DHT22 ni bibliotecas de sensores adicionales.

## 1. Cableado con la placa desconectada del USB

Este cableado es para ESP32 clásico, con módulo marcado ESP32-WROOM-32,
y un LDR suelto de dos patas. Tener 38 pines no identifica por sí solo el chip;
si dice S3, C3 u otro modelo, revisa su pinout antes de conectar.
Usa los nombres impresos en la placa, no el número de posición del pin.

Materiales: LDR, resistencia de 10 kΩ, protoboard, cables y USB de datos.

```text
ESP32 3V3 ─── LDR ────┬──── resistencia 10 kΩ ─── ESP32 GND
                      │
                  ESP32 GPIO34
```

El LDR no tiene polaridad. Una pata va a 3V3; la otra comparte una fila de la
protoboard con GPIO34 y una pata de la resistencia. La otra pata de la resistencia
va a GND. Con este divisor, más luz normalmente aumenta el valor leído.
Alimenta la placa por USB después de terminar el cableado.
Usa 3V3 para el divisor; no conectes 5V/VIN a GPIO34.

Si tienes un módulo con pines VCC, GND, AO y DO, y admite alimentación a 3.3 V:
VCC → 3V3, GND → GND, AO → GPIO34. Deja DO sin conectar; el divisor ya suele
estar incorporado. Un módulo solo con DO no permite esta lectura analógica.

GPIO34 pertenece a ADC1 del ESP32 clásico y sirve para leer mientras funciona
WiFi. El valor ADC de 12 bits va de 0 a 4095: no representa lux ni W/m².
Puede saturarse con luz intensa; primero prueba tapándolo y destapándolo.

## 2. Preparar PostgreSQL

En pgAdmin, conectado a AGROINDUSTRIAL, ejecuta:

```sql
BEGIN;
ALTER TABLE lectura_esp32 ALTER COLUMN temperatura DROP NOT NULL;
ALTER TABLE lectura_esp32 ALTER COLUMN humedad DROP NOT NULL;
COMMIT;
```

También está guardado en `sql/esp32_solo_ldr.sql`. Permite guardar NULL cuando
no hay sensor de temperatura o humedad y conserva las lecturas existentes.
Es necesario en una tabla ya creada: reiniciar FastAPI no cambia sus restricciones.

## 3. Arrancar el backend

Detén la instancia anterior de Uvicorn con Ctrl+C en su terminal.
Abre PowerShell y ejecuta (elige una clave propia y consérvala para el Arduino):

```powershell
cd D:\PRUEBA\mi-app
$env:ESP32_API_KEY = 'PON_AQUI_TU_CLAVE_API'
..\env\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Deja esta terminal abierta. Verifica desde un teléfono en la misma red:
`http://192.168.100.8:8000/healthcheck`.
Debe responder `status: conectado`. Si no abre, comprueba la IP actual con
ipconfig y permite Python/TCP 8000 en el firewall de Windows para la red privada.
No desactives todo el firewall. La red debe permitir que los clientes se comuniquen.

## 4. Arduino IDE

1. Si falta el soporte ESP32, añade en Preferencias → URLs adicionales del Gestor de placas:
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`.
2. En el Gestor de placas instala **esp32 by Espressif Systems**.
3. Para el ESP32-WROOM-32 clásico selecciona **ESP32 Dev Module** y su puerto COM.
4. Abre `firmware/esp32_ldr/esp32_ldr.ino`.
5. Modifica `WIFI_SSID`, `WIFI_PASSWORD` y `API_KEY`. La última debe ser exactamente
   la clave del paso 3. No compartas tu contraseña WiFi.
6. Conserva `DEVICE_ID = 26` y la URL `http://192.168.100.8:8000/api/esp32/lecturas`.
7. Usa WiFi de 2.4 GHz con acceso a la laptop. Sube el programa por USB.
8. Si queda esperando en Connecting, mantén BOOT mientras comienza la carga y
   suéltalo al empezar a escribir. Abre Monitor serie a **115200 baudios**.

Debería mostrar la IP del ESP32 y `LDR: ... / 4095 | HTTP: 201` cada 10 segundos.
Cada envío toma el promedio de 16 lecturas. Si pierde WiFi intenta reconectarse;
no guarda una cola de muestras cuando la red está caída.

## 5. Verlo en la aplicación

En **Monitoreo → Monitoreo Climático**, selecciona el invernadero correspondiente
al ID 3 y **ESP32 Central · ID 26** en el panel de conectividad ESP32.
Tapa el LDR y después ilumínalo: compara las nuevas lecturas y la hora de recepción.
El panel se actualiza cada 10 segundos. Temperatura y humedad mostrarán “Sin sensor”.
Esta lectura aparece en ese panel, no en los gráficos antiguos de luz solar.

Puedes comprobar la persistencia en pgAdmin:

```sql
SELECT id, id_dispositivo, luz_adc, simulado, recibido_en
FROM lectura_esp32
WHERE id_dispositivo = 26
ORDER BY id DESC
LIMIT 10;
```

Diagnóstico rápido:
- HTTP 201: lectura guardada.
- HTTP 401: API_KEY diferente de ESP32_API_KEY.
- HTTP 404: ID del dispositivo inexistente.
- HTTP 422: JSON inválido; revisa que ejecutas el backend actualizado.
- HTTP 503: falta la clave del servidor o falla la BD (incluida la migración del paso 2).
- HTTP negativo: revisa red, URL, backend y firewall.
- Siempre 0 o 4095: revisa el divisor, GPIO34 y prueba distintos niveles de luz.

Referencias oficiales:
- [Instalación Arduino ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html).
- [API ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html).
- [ADC1 y restricciones de WiFi](https://docs.espressif.com/projects/esp-idf/en/v4.2/esp32/api-reference/peripherals/adc.html).
