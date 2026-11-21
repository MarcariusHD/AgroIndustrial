# Sensores en vivo y propuesta de pronóstico

Estado de invernaderos consulta `/api/esp32/invernaderos/{id}/lecturas`
cada 10 segundos. El endpoint devuelve la última lectura real de cada
dispositivo del invernadero seleccionado. Las simulaciones se excluyen.
La tarjeta muestra fecha y dispositivo; después de 30 segundos sin lectura
reciente deja de anunciar el valor como «En vivo».

Humedad del suelo utiliza `humedad_suelo`, calculada por el firmware con
sus referencias de calibración. No sustituye este valor por humedad del aire.
Tanque de agua utiliza `agua_adc / 4095 * 100`: porcentaje de señal analógica
de 12 bits. No es una calibración del volumen ni del nivel de llenado del tanque.
El montaje actual usa WATER_WET_IS_LOW=0. Un sensor de salida digital
no proporciona un porcentaje. Las lecturas ausentes se muestran como «Sin datos».
No se modifica el firmware ni el control de riego.

## Pronóstico: propuesta, aún sin conectar

La gráfica de MonitoreoGeneral/ClimateTrendChart contiene series ilustrativas.
Para reemplazarlas por un pronóstico meteorológico exterior:

1. Registrar latitud y longitud de cada invernadero; no asumir que todos
   están en la ubicación del navegador o del usuario.
2. Consultar Open-Meteo desde FastAPI mediante GET a `/v1/forecast`, con
   `latitude`, `longitude`, `timezone=America/La_Paz` para ubicaciones en Bolivia
   y `forecast_days=7`.
3. Solicitar por hora `temperature_2m`, `relative_humidity_2m`,
   `precipitation_probability`, `weather_code`, `wind_speed_10m`;
   por día `temperature_2m_max`, `temperature_2m_min`,
   `precipitation_probability_max`, `sunrise`, `sunset`.
4. Exponer una ruta propia `/api/invernaderos/{id}/pronostico`, con caché
   por ubicación de 30 minutos, timeout y estado explícito si falla el proveedor.
5. Mostrar las próximas 24/48 horas y los próximos 7 días en Recharts,
   con fecha, zona horaria, fuente y última consulta. Mantener diferenciadas
   la humedad del suelo medida, la humedad ambiental pronosticada y
   la probabilidad de lluvia. No reemplazar fallos por valores inventados.

El pronóstico exterior no predice directamente la temperatura dentro del
invernadero. Un modelo interior requerirá historial de temperatura y humedad
ambiental, datos exteriores y registros de riego/ventilación, además de validación.
Los sensores de suelo y detección de agua actuales no bastan para ese modelo.

Documentación oficial: https://open-meteo.com/en/docs
