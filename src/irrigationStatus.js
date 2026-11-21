const labels = {
  iniciando: 'Preparando sensores', pausado: 'Riego pausado',
  sin_agua: 'Sin agua detectada: riego bloqueado',
  sensor_suelo_invalido: 'Revisar sensor de suelo: riego bloqueado',
  suelo_humedo: 'Suelo húmedo: bomba apagada', listo: 'Esperando suelo seco',
  regando: 'Regando', espera_absorcion: 'Bomba apagada: esperando absorción',
  limite_riego: 'Límite de riego alcanzado: revisar agua, manguera y sensor',
};
export function irrigationStatus(reading, now = Date.now()) {
  if (!reading) return null;
  const timestamp = Date.parse(reading.recibido_en);
  if (!Number.isFinite(timestamp) || now - timestamp > 30000) {
    return { warning: true, text: 'Sin datos recientes del ESP32. No se puede confirmar el estado actual de la bomba.' };
  }
  const prefix = reading.simulado ? 'Simulación: ' : '';
  if (reading.agua_detectada === false) {
    return { warning: true, text: prefix + (reading.estado_riego
      ? 'Sin agua detectada. Revisar depósito y sensor; el control automático bloquea el riego.'
      : 'Sin agua detectada. Revisar depósito y sensor; esta lectura no confirma un bloqueo automático.') };
  }
  return { warning: ['limite_riego', 'sensor_suelo_invalido'].includes(reading.estado_riego),
    text: prefix + (labels[reading.estado_riego] || 'Telemetría recibida; automatización sin informar.') };
}
