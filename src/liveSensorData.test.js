import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveSensorCards, waterSignalPercent } from './liveSensorData.js';

test('señal de lluvia: extremos, valor intermedio y datos ausentes', () => {
  assert.equal(waterSignalPercent(0), 0);
  assert.equal(waterSignalPercent(4095), 100);
  assert.equal(waterSignalPercent(2047.5), 50);
  for (const value of [null, undefined, NaN, Infinity, -1, 4096, '100']) {
    assert.equal(waterSignalPercent(value), null);
  }
});

test('usa lecturas reales recientes, conserva cero y distingue suelo de aire', () => {
  const cards = liveSensorCards([
    { id: 1, simulado: false, humedad_suelo: 50, recibido_en: '2026-10-18T10:00:00Z' },
    { id: 2, simulado: false, humedad_suelo: 0, agua_adc: 4095, recibido_en: '2026-10-18T10:01:00Z' },
    { id: 3, simulado: true, humedad_suelo: 99, recibido_en: '2026-10-18T10:02:00Z' },
    { id: 4, simulado: false, humedad: 80, recibido_en: '2026-10-18T10:03:00Z' },
  ]);
  assert.equal(cards.find(row => row.nombre === 'Humedad del suelo').valor, 0);
  assert.equal(cards.find(row => row.nombre === 'Tanque de agua').valor, 4095);
  assert.equal(cards.find(row => row.nombre === 'Temp. Aire').valor, null);
  assert.ok(liveSensorCards().every(row => row.valor === null));
});

test('ambiente y ventiladores conservan cero y apagado, sin inventar datos antiguos', () => {
  const readings = [{ id: 1, simulado: false, temperatura: 0, humedad: 70,
    ventilador1_activado: false, recibido_en: '2026-11-19T10:00:00Z' }];
  const cards = liveSensorCards(readings);
  assert.equal(cards.find(row => row.nombre === 'Ventilador 1').valor, false);
  assert.equal(cards.find(row => row.nombre === 'Ventilador 2').valor, null);
  assert.equal(cards.find(row => row.nombre === 'Temp. Aire').valor, 0);
  const ambient = liveSensorCards(readings, { ambientOnly: true });
  assert.equal(ambient.length, 4);
  assert.ok(ambient.every(row => !row.nombre.includes('suelo')));
  assert.equal(ambient.find(row => row.nombre === 'Humedad ambiente').valor, 70);
});
