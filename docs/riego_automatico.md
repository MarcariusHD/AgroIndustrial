# Programa unificado: suelo, agua, rele y web

Abrir `firmware/esp32_suelo_agua/esp32_suelo_agua.ino`.
La carpeta incluye `config.h`, `irrigation.h` e `irrigation_checks.h`.
El ultimo ejecuta pruebas del controlador al compilar; no activa hardware.

## Montaje de la prueba

- FC-28 AO: P33. Agua AO: P32. Ambos alimentados a 3.3 V, GND comun.
- Rele IN: P23; activo LOW segun las pruebas del usuario. VCC: 5 V fijo; GND comun.
- Mantener el selector de sensores del shield a 3.3 V.
- LiPo positiva -> COM, NO -> positivo de bomba, negativo de bomba -> negativo LiPo.
- ESP32 alimentado por USB. Mantener las 18650 y el BMS desconectados: al probarlos
  el usuario observo que se apagaron los LEDs. No volver a conectarlos sin diagnosticar.
- La conmutacion observada no certifica compatibilidad electrica del modulo IN con
  el GPIO. El software no protege contra sobretension, rele pegado o activacion en reset.

## Reglas iniciales configurables en config.h

| Situacion | Accion |
|---|---|
| Humedad menor de 30 % y agua presente | Pulso de hasta 2 segundos |
| Humedad de 60 % o mayor | Apagar y terminar ciclo |
| Entre 30 y 60 % | Continuar ciclo ya iniciado, o esperar si no habia demanda |
| Fin del pulso | Apagar y esperar 30 segundos para absorcion |
| Tres pulsos sin alcanzar humedad de parada | Bloquear en limite_riego |
| No hay agua detectada | Apagar/bloquear y avisar |
| Suelo ADC 0 o 4095 | Apagar/bloquear y avisar sensor_suelo_invalido |

30/60 % son umbrales iniciales para puesta en marcha, no recomendaciones agronomicas.
El porcentaje es relativo: suelo seco 3950 ADC, referencia humeda 2155 ADC.
Se requiere humedad seca confirmada durante tres muestras antes de arrancar y hay
una espera inicial de cinco segundos. Lecturas cada 100 ms aproximadamente.
El tope por ciclo seco es tres pulsos (hasta seis segundos); se reinicia al alcanzar
60 %, al rearmar expresamente o al reiniciar la placa. No es un presupuesto diario.
Una lectura flotante puede parecer valida: los limites ADC no detectan todos los
cables desconectados. Probar siempre con sensores correctamente montados.

Agua: para la calibracion del usuario, entra en presente tras tres muestras por
encima de 1200 ADC y sale al bajar a 800 ADC o menos. La banda evita oscilaciones.
Pistas aun mojadas pueden indicar agua fuera del recipiente; no mide nivel ni
garantiza que la bomba tenga agua. No usar como unica proteccion de trabajo en seco.

## Ordenes por monitor serie (115200)

- X: apagar y pausar. Se conserva hasta A o reinicio.
- A: rearmar estando apagada, reiniciar el contador y esperar 30 segundos.
- No hay orden de encendido continuo ni boton remoto en esta version.

El control local continua sin WiFi/backend. HTTP funciona en otra tarea para no
bloquear el apagado. El monitor informa estados; HTTP 201 confirma persistencia.
Se envian cambios de estado y una lectura cada 10 segundos. Cola volatil limitada;
las muestras mayores de 15 segundos se descartan y no se reintentan envios fallidos.
No hay garantia de registrar cada evento durante una caida de red.

## Backend y avisos

En PostgreSQL existente ejecutar `sql/esp32_riego_automatico.sql` y reiniciar FastAPI.
La nueva columna `estado_riego` es opcional para mantener firmware antiguo compatible.
En instalacion nueva se crea junto con las demas columnas al arrancar la aplicacion.
La clave del backend debe coincidir con config.h, como en las pruebas anteriores.

Detener el servidor anterior con Ctrl+C y arrancar desde `D:\PRUEBA\mi-app`:

```powershell
..\env\Scripts\python.exe scripts/start_esp32_backend.py
```

Este lanzador lee la clave del config.h local sin mostrarla. No carga firmware.

El panel ESP32 de Monitoreo Climatico muestra aviso rojo cuando no detecta agua,
cuando alcanza el limite o hay lectura de suelo invalida. El historial conserva
el estado recibido. El aviso desaparece al recibir una condicion recuperada.
La web consulta cada 10 segundos y avisa si la ultima lectura tiene mas de 30 segundos.
Son avisos dentro de la web abierta, no WhatsApp, SMS ni notificaciones push.
La PC/backend deben seguir encendidos para guardar y mostrar los datos.
`rele_activado` representa la orden electrica, no flujo confirmado.

## Carga y prueba supervisada

1. Desconectar la LiPo de la bomba antes de cargar este firmware: ahora es automatico.
2. Reabrir el proyecto en Arduino IDE y revisar config.h. Mantener los cuatro
   archivos juntos. Seleccionar ESP32 Dev Module y subir a 115200.
3. Sin potencia en la bomba, probar seco/humedo y agua ausente/presente, observando
   contactos del rele, estados y HTTP 201. Para simular seco, usar tierra seca,
   no la sonda al aire (4095 bloquea el riego).
4. Con suelo humedo y rele apagado, preparar la bomba sumergida, manguera dirigida
   a un recipiente, conexiones aisladas y proteccion del motor ya revisada.
5. Conectar la LiPo y supervisar un ciclo. Confirmar apagado al humedecer suelo,
   perdida de deteccion de agua, fin de pulso y orden X.
6. Si los contactos no siguen la orden, desconectar la LiPo inmediatamente.

No se ha cargado ni probado fisicamente esta version desde el asistente.
