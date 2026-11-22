# ESP32: FC-28 y detección de agua → base de datos

El firmware está en `firmware/esp32_suelo_agua/esp32_suelo_agua.ino`.
Usa el backend `main.py`, la tabla `lectura_esp32` y el panel de conectividad
en Monitoreo Climático. Mantiene compatibilidad con el firmware LDR anterior.

## 1. Elegir AO o DO antes de cargar

Para ESP32 clásico (WROOM-32), no S3/C3:

| Sensor | Salida AO, configuración predeterminada | Salida DO, alternativa |
|---|---|---|
| FC-28 | AO → P33 | DO → P27, `SOIL_ANALOG 0` |
| Lluvia usado para detectar agua | AO → P32 | DO → P26, `WATER_ANALOG 0` |
| Relé | IN → P14, solo tras verificar módulo | Igual |

AO ofrece un valor 0–4095. DO solo ofrece dos estados y depende del potenciómetro
y la polaridad del módulo. Se puede elegir AO/DO por separado para cada sensor.
P26/P27 son ADC2 y no sirven para lectura analógica con Wi-Fi activo.
Configura con la alimentación desconectada. Usa alimentación de sensores a 3.3 V
si la versión del módulo lo admite y GND común. Verifica que ninguna salida hacia
el ESP32 supere 3.3 V; nunca conectes una salida de 5 V directamente a sus GPIO.
En el shield S es señal, V alimentación, G tierra. Comprueba el jumper V y el
voltaje real: una foto comercial no confirma el cableado de tu placa.

El detector de lluvia informa mojado/contacto; no mide por sí solo altura, litros
o porcentaje de un depósito. Ubicarlo en un punto puede servir para detectar agua
en ese punto, pero requiere probar el montaje y no garantiza que la bomba tenga agua.

## 2. Alimentación y relé

La entrada DC6.5–16V de la expansión es una entrada de alimentación, no una señal
del relé. Dos celdas 18650 en serie dan nominalmente 7.4 V (hasta 8.4 V cargadas):
no lleves ese voltaje directamente a la bomba o al relé de 5 V. Requieren una fuente
regulada de 5 V dimensionada también para el arranque de la bomba.
La LiPo 1S es 3.7 V nominal y no proporciona 5 V regulados por sí sola.
El BMS 2S no sustituye un cargador 2S ni un regulador de 5 V.

Antes de conectar potencia verifica VCC/GND/IN del KY-019, compatibilidad de IN con
3.3 V, polaridad de activación, COM/NO y protección de la carga inductiva según
el módulo. Usa NO para que el circuito de la bomba quede abierto en reposo.
No se puede confirmar ese circuito únicamente con la foto del shield.
El firmware deja `RELAY_CONNECTED 0`: no controla P14 y no debe probarse así con
el relé conectado a una entrada flotante. Desconecta IN y la alimentación de la
bomba durante la primera prueba de sensores. Una vez verificado el módulo,
configura la polaridad y `RELAY_CONNECTED 1`: mantiene la orden de apagado.
No hay riego automático ni control de LEDs UV en esta integración de telemetría.
`rele_activado` representa la orden lógica, no una confirmación de flujo o movimiento.

## 3. Actualizar la base y arrancar

En una base existente ejecuta `sql/esp32_suelo_agua.sql` en pgAdmin sobre
AGROINDUSTRIAL antes de reiniciar FastAPI. Es transaccional y repetible; conserva
los datos anteriores. En una instalación vacía `create_all` crea el esquema nuevo.
Reiniciar por sí solo no migra una tabla existente.

Desde `D:\PRUEBA\mi-app`:

```powershell
$env:ESP32_API_KEY = 'TU_CLAVE_PRIVADA'
..\env\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

PostgreSQL debe estar iniciado y accesible con la configuración de `database.py`.
El dispositivo 26 y la IP 192.168.100.8 provienen de la prueba anterior: confirma
el ID en la web y la IP actual con `ipconfig`. No uses localhost desde el ESP32.

## 4. Cargar el firmware y comprobar

1. Copia `config.example.h` como `config.h` en la misma carpeta del firmware.
2. Configura Wi-Fi 2.4 GHz, contraseña, API_URL, API_KEY y DEVICE_ID.
3. Configura AO/DO según el cableado de la tabla. No cargues la configuración AO
   predeterminada si los sensores siguen conectados a P26/P27.
4. Compila y carga con Arduino IDE y el soporte ESP32 de Espressif.
   No requiere bibliotecas DHT ni ArduinoJson. Monitor serie: 115200 baudios.
5. Debe imprimir el JSON medido y HTTP 201 cada 10 segundos.
6. Abre Monitoreo Climático, elige el invernadero y dispositivo ESP32.
   Compara sensor seco/mojado y la hora de las lecturas.

HTTP 401: clave incorrecta; 404: dispositivo no registrado; 422: datos inválidos;
503: clave ausente o almacenamiento fallido. Un error de red requiere revisar IP,
Wi-Fi, backend y acceso TCP 8000 en la red privada. HTTP se usa solo en LAN confiable.
No hay cola offline: un envío fallido se descarta y el siguiente toma otra muestra.

```sql
SELECT id, id_dispositivo, suelo_adc, humedad_suelo, suelo_seco,
       agua_adc, agua_detectada, rele_activado, simulado, recibido_en
FROM lectura_esp32 ORDER BY id DESC LIMIT 20;
```

## 5. Calibrar

Con AO, anota `suelo_adc` en suelo seco y en suelo húmedo de referencia.
Pon esos valores en SOIL_DRY_ADC y SOIL_WET_ADC, distintos entre sí, y habilita
SOIL_CALIBRATED. El porcentaje es relativo a esas referencias, no humedad
volumétrica de laboratorio. Sin calibración se guarda solo ADC.
Para agua mide seco/mojado y configura WATER_THRESHOLD_ADC, WATER_WET_IS_LOW
y WATER_CALIBRATED. Sin calibración no se afirma presencia de agua a partir de AO.
Con DO prueba ambos estados y ajusta potenciómetro y SOIL_DRY_LEVEL/
WATER_PRESENT_LEVEL; no se obtiene porcentaje de DO.

Referencias: [ADC y Wi-Fi de Espressif](https://docs.espressif.com/projects/esp-idf/en/release-v4.2/esp32/api-reference/peripherals/adc.html),
[ADC Arduino ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html).
