import test from 'node:test';
import assert from 'node:assert/strict';
import { irrigationStatus } from './irrigationStatus.js';
const now = Date.parse('2026-10-08T15:00:00Z');
const base = { recibido_en: new Date(now).toISOString(), simulado: false };
test('avisa falta de agua y recupera estado al volver', () => {
  assert.equal(irrigationStatus({ ...base, agua_detectada: false, estado_riego: 'sin_agua' }, now).warning, true);
  assert.equal(irrigationStatus({ ...base, agua_detectada: true, estado_riego: 'suelo_humedo' }, now).warning, false);
});
test('datos antiguos nunca confirman bomba actual ni ausencia actual de agua', () => {
  const status = irrigationStatus({ ...base, agua_detectada: false }, now + 31000);
  assert.match(status.text, /Sin datos recientes/);
});
test('distingue simulacion, errores y firmware sin automatizacion', () => {
  assert.match(irrigationStatus({ ...base, simulado: true, agua_detectada: false }, now).text, /Simulación/);
  assert.match(irrigationStatus({ ...base, agua_detectada: false }, now).text, /no confirma/);
  assert.equal(irrigationStatus({ ...base, estado_riego: 'limite_riego' }, now).warning, true);
  assert.equal(irrigationStatus({ ...base, estado_riego: 'sensor_suelo_invalido' }, now).warning, true);
  assert.equal(irrigationStatus({ ...base, agua_detectada: null }, now).warning, false);
});
