import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeEnergy } from './deviceEnergyUtils.js';

test('diferencia un cero medido de un dispositivo sin datos', () => {
  const summary = summarizeEnergy([{ id: 1, nombre: 'Luz', kwh: 0 }, { id: 2, nombre: 'Bomba', kwh: null }]);
  assert.equal(summary.total, 0);
  assert.equal(summary.measured.length, 1);
  assert.equal(summary.missing, 1);
});
test('suma kWh, ordena consumo y distingue nombres repetidos por ID', () => {
  const summary = summarizeEnergy([{ id: 1, nombre: 'Luz', kwh: '1.25' }, { id: 2, nombre: 'Luz', kwh: '3.5' }]);
  assert.equal(summary.total, 4.75);
  assert.equal(summary.measured[0].id, 2);
  assert.notEqual(summary.measured[0].label, summary.measured[1].label);
});
test('sin lecturas no informa un total de cero', () => {
  assert.equal(summarizeEnergy([{ id: 1, kwh: null }]).total, null);
  assert.equal(summarizeEnergy([]).total, null);
});
