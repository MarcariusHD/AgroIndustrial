# Gráficos de Dispositivos Activos

“Salud de la Red” se sustituye por “Consumo de energía”, con barras horizontales por dispositivo y valores en kWh. El periodo puede ser 24 horas, 7 días o 30 días. El dispositivo seleccionado se resalta en verde; al pulsar otra barra o el nombre de la tabla, cambia la selección del directorio. La tabla muestra también dispositivos sin registros; un dato ausente no se interpreta como cero.

La API GET `/dashboard/consumo-energia?id_inv=ID&horas=24` suma los valores de `consumo_energetico.kwh` dentro del periodo, agrupados por dispositivo del invernadero. Los registros deben contener energía consumida por intervalo, no un contador acumulativo de medidor. Si el equipo entrega un contador acumulativo, el proceso de captura debe guardar las diferencias antes de usar esta suma. La consulta usa la hora local de PostgreSQL, igual que la columna `fecha_hora` existente. No requiere migración.

Los gráficos anteriores de calidad de señal y estabilidad energética conservan sus series de ejemplo; ahora indican que son simuladas. Tienen ejes 0–100 %, horas, etiquetas, detalle al pasar el cursor y resúmenes de última muestra, promedio y mínimo. Esas series no se usan para calcular energía ni se guardan como mediciones reales.

Archivos: `src/DispositivosActivos.jsx`, `src/DeviceEnergyChart.jsx`, `src/deviceEnergyUtils.js`, `energy_api.py`. Reiniciar el backend para cargar la nueva ruta.
