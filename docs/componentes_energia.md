# Componentes y consumo

En Gestion -> Componentes electronicos -> Anadir/Editar se guardan GPIO,
ESP32 de origen, metrica, potencia nominal o voltaje/corriente y metodo de uso.
Estos campos no cambian el firmware ni controlan hardware.

Ejemplo de vinculacion del montaje (sin inventar potencias):

| Componente | ESP32 | Metrica | Pin | Uso |
|---|---|---|---|---|
| FC-28 | 26 | humedad_suelo | 33 | continuo |
| Sensor de agua | 26 | agua_detectada | 32 | continuo |
| Bomba | 26 | rele_activado | 23 | rele |
| Rele (bobina) | 26 | rele_activado | 23 | rele |
| ESP32 Central | propio | controlador | sin especificar | continuo |

Introducir valores electricos de la ficha del componente o medidos a su voltaje
real de trabajo. No atribuir automaticamente el consumo nominal de 5 V a una bomba
alimentada a 3.7 V. Si no hay datos, el sistema muestra Sin configurar.

P(W) = V * mA / 1000, salvo que se haya introducido W, que tiene prioridad.
E(kWh) = P(W) * segundos estimados / 3 600 000.

Se calcula usando todo el historial real del periodo de 24 h, 7 o 30 dias.
Las 20 filas del panel son solo una ventana de visualizacion: no borran registros.
Para cada par consecutivo de muestras (maximo 15 segundos de separacion), se
supone que la orden anterior se mantiene hasta la siguiente. No se extrapola
desde la ultima lectura, ni se rellenan huecos offline. Se informa la cobertura.
Un intervalo apagado conocido puede estimarse como cero; ausencia de intervalos
o de potencia queda como desconocida, nunca como cero.

Los tiempos dependen de las fechas de recepcion en el servidor: latencia y eventos
perdidos limitan su precision. La orden del rele no confirma que la LiPo o la bomba
estuvieran conectadas. Por eso el calculo es energia estimada por orden, no medida.
Los valores configurados actuales se aplican retrospectivamente al periodo.
No sumar una fuente/bateria junto a sus cargas ni duplicar el mismo componente.

Dispositivos activos reemplaza series artificiales de senal/estabilidad por
inventario, canales reportados, telemetria real y energia estimada. El grafico
anterior de consumo medido se mantiene aparte sin mezclar ambas fuentes.
Canales reportados se deduplican por ESP32; no son numero de componentes fisicos.
La etiqueta Activo en inventario no prueba conectividad: se usa fecha <=30 s.

Migracion existente: ejecutar sql/componentes_electronicos.sql y reiniciar backend.
Las nuevas bases incluyen la columna config_electronica al crear las tablas.
POST/PUT /dispositivos admiten config_electronica; sin campo en PUT se conserva.
GET /dashboard/componentes-telemetria?id_inv=3&horas=24 devuelve resumen y formula.
