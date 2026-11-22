// Porcentaje de señal ADC, no porcentaje de volumen de agua.
export const waterSignalPercent = adc => (
  typeof adc === 'number' && Number.isFinite(adc) && adc >= 0 && adc <= 4095
    ? adc / 4095 * 100 : null
);

export function liveSensorCards(readings = [], { ambientOnly = false } = {}) {
  const real = readings.filter(row => row.simulado === false)
    .sort((a, b) => Date.parse(b.recibido_en) - Date.parse(a.recibido_en) || b.id - a.id);
  const cards = [
    { nombre: 'Temp. Aire', field: 'temperatura', unidad: '°C' },
    { nombre: 'Humedad ambiente', field: 'humedad', unidad: '%' },
    { nombre: 'Temperatura exterior', field: 'temperatura_exterior', unidad: '°C' },
    { nombre: 'Humedad exterior', field: 'humedad_exterior', unidad: '%' },
    { nombre: 'Humedad del suelo', field: 'humedad_suelo', unidad: '%' },
    { nombre: 'Suelo 2', field: 'suelo2_adc', unidad: 'ADC' },
    { nombre: 'Tanque de agua', field: 'agua_adc', unidad: 'ADC' },
    { nombre: 'Agua disponible', field: 'agua_detectada', labels: ['Sin agua', 'Agua detectada'] },
    { nombre: 'Lluvia', field: 'lluvia_detectada', labels: ['Sin lluvia', 'Lluvia detectada'] },
    { nombre: 'Bomba', field: 'rele_activado', labels: ['Apagada', 'Encendida'] },
    { nombre: 'Ventilador 1', field: 'ventilador1_activado', labels: ['Apagado', 'Encendido'] },
    { nombre: 'Ventilador 2', field: 'ventilador2_activado', labels: ['Apagado', 'Encendido'] },
  ];
  return (ambientOnly ? cards.slice(0, 4) : cards).map(card => {
    const reading = real.find(row => card.labels ? typeof row[card.field] === 'boolean' : typeof row[card.field] === 'number' && Number.isFinite(row[card.field]));
    return { ...card,
      valor: reading ? reading[card.field] : null,
      recibido_en: reading?.recibido_en,
      deviceId: reading?.id_dispositivo,
    };
  });
}
