# ESP32 → FastAPI → PostgreSQL → React

Para la version unificada con **riego automatico en P23**, consultar
[riego automatico](riego_automatico.md): reglas, carga y avisos de falta de agua.

Para **FC-28 y sensor de lluvia/contacto con agua**, sigue
[la guía de suelo y agua](esp32_suelo_agua.md), con firmware, migración y opciones AO/DO.

Para la prueba actual con **solo LDR**, laptop `192.168.100.8` y dispositivo `26`,
sigue [la guía ESP32 + LDR](esp32_ldr.md). Incluye el cableado, el programa sin DHT
y el SQL para permitir temperatura y humedad ausentes en la tabla existente.

La entrada del proyecto es `main.py` en la raíz de `mi-app`, no `Backend/main.py`.
El nuevo panel está en Dashboard → Monitor Climático. Guarda las lecturas en
`lectura_esp32`, sin mezclar las pruebas con las tablas legadas `lectura` y `telemetria`.
Los otros gráficos existentes no se han convertido a esta nueva fuente.

## 1. Preparar API y dispositivo

Desde `D:\PRUEBA\mi-app`, con el entorno Python del proyecto activo:

```powershell
$env:ESP32_API_KEY = 'elige-una-clave-larga-y-aleatoria'
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

PostgreSQL debe estar iniciado y configurado en `database.py`. Al arrancar la API se
crea la nueva tabla si no existe. No se cambian las tablas actuales.
En la aplicación registra un dispositivo llamado ESP32, asociado a tu invernadero.
Obtén su ID desde `GET /dashboard/dispositivos?id_inv=ID_INVERNADERO` en `/docs`.
La clave habilita la ingesta de todos los dispositivos registrados; es una clave
compartida para esta prueba local, no una identidad independiente por placa.

## 2. Probar sin placa ni sensores

En otra terminal, configura la misma clave y ejecuta:

```powershell
$env:ESP32_API_KEY = 'la-misma-clave-del-servidor'
python scripts/simulate_esp32.py --device-id 1 --count 3
```

Reemplaza `1` por el ID real. Cada envío debe devolver HTTP 201 con el ID de la
lectura guardada. Un 401 indica clave incorrecta; 404, dispositivo inexistente;
422, datos fuera de rango; 503, configuración o almacenamiento no disponible.

## 3. Consultar PostgreSQL y la API

En pgAdmin, conectado a la base del proyecto:

```sql
SELECT id, id_dispositivo, temperatura, humedad, luz_adc, simulado, recibido_en
FROM lectura_esp32
ORDER BY id DESC LIMIT 20;
```

- `GET /api/esp32/dispositivos/1/ultima`: última lectura o `null` si aún no hay datos.
- `GET /api/esp32/dispositivos/1/historial?limite=20`: recientes primero.
- Paginación: `antes_de=ID_MAS_ANTIGUO`; filtro `modo=simulado`, `real` o `todos`.
- La fecha de recepción la asigna el servidor en UTC. React la muestra en hora local.

Abre Monitor Climático, selecciona el invernadero y el dispositivo en el nuevo panel.
Se consultan ambos endpoints cada 10 segundos y se indica si las muestras son simuladas.
Si necesitas otro servidor para React, define `VITE_API_BASE_URL` al iniciar Vite.

## 4. Conectar el ESP32 por WiFi

1. Instala el soporte de placas ESP32 de Espressif en Arduino IDE y selecciona tu placa.
2. Copia `firmware/esp32_telemetry/config.example.h` como `config.h` en esa misma carpeta.
3. Configura SSID, contraseña, clave API e ID. Conserva `SIMULATED_DATA 1`.
4. Ejecuta `ipconfig` en la PC y coloca su IPv4 de red local en `API_URL`.
   No uses `localhost` ni `127.0.0.1`: desde la placa apuntarían al propio ESP32.
5. Conecta la PC y el ESP32 a una red que permita comunicación entre clientes.
   Para un ESP32 clásico usa WiFi de 2.4 GHz. Permite TCP 8000 en el firewall de la
   PC para la red privada si hace falta. No abras puertos del router a Internet.
6. Abre `esp32_telemetry.ino`, compila y carga por USB. Monitor serie: 115200 baudios.
   Debes ver la IP y HTTP 201 cada 10 segundos.

El firmware reconecta WiFi y aplica tiempos máximos a HTTP. Si un envío falla,
intenta con una nueva muestra en el siguiente intervalo: no conserva muestras
offline. HTTP y la clave compartida se destinan a esta prueba en una LAN confiable.

## 5. Cuando tengas DHT22 y LDR

- Instala **DHT sensor library** de Adafruit y su dependencia **Adafruit Unified Sensor**.
- Cambia `SIMULATED_DATA` a `0` y vuelve a cargar. No cambia el contrato JSON.
- Pines de ejemplo para **ESP32 clásico**: DHT22 DATA en GPIO4, LDR en GPIO34 (ADC1).
  Verifica el pinout si tienes otra variante, como C3 o S3.
- DHT22: alimentación a 3.3 V, tierra común y resistencia pull-up de DATA a 3.3 V
  según el módulo (algunos ya la incluyen).
- LDR: divisor `3.3 V → LDR → GPIO34 → resistencia 10 kΩ → GND`.
  Nunca apliques 5 V al ADC. El valor es ADC de 12 bits, no lux ni porcentaje calibrado.
- Un fallo del DHT cancela esa muestra; no sustituye lecturas reales por valores falsos.

Referencias: [WiFi de Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html),
[ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html),
[ejemplo HTTPClient](https://github.com/espressif/arduino-esp32/blob/master/libraries/HTTPClient/examples/BasicHttpClient/BasicHttpClient.ino).

## Verificación automatizada

Con `httpx` instalado en el entorno de desarrollo:

```powershell
python -m unittest discover -s tests -p test_esp32.py -v
npm run build
```

Las pruebas usan SQLite temporal en memoria para validar el contrato, las consultas,
la clave y los rangos. La comprobación física del WiFi y del firmware requiere la placa.
