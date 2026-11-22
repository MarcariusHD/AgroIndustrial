import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptySoilForm, loadSoilForm, soilPayload } from './soilForm.js';

test('no determinado se guarda como null y cero se conserva', () => {
  const form = emptySoilForm();
  form.resultados.ph.valor = '0';
  const payload = soilPayload(form).formulario;
  assert.equal(payload.resultados.ph.valor, 0);
  assert.equal(payload.resultados.ec.valor, null);
  assert.equal(payload.superficie_ha, null);
});
test('carga registros anteriores sin reinterpretar nitrógeno ni humedad', () => {
  const form = loadSoilForm({ id_muestra: '001', n: 42, humedad: 30, ph: 0, profundidad: '0-20 cm' });
  assert.equal(form.numero_muestra, '001');
  assert.equal(form.resultados.n_total.valor, '');
  assert.equal(form.humedad_campo, '');
  assert.equal(form.resultados.ph.valor, 0);
  assert.equal(form.profundidad_hasta, '20');
});
test('recarga mantiene unidad, método, resultados e identificación', () => {
  const form = emptySoilForm();
  form.numero_muestra = '002';
  form.resultados.k = { valor: '75', unidad: 'mg/kg', metodo: 'Mehlich-3' };
  const loaded = loadSoilForm(soilPayload(form));
  assert.equal(loaded.numero_muestra, '002');
  assert.deepEqual(loaded.resultados.k, { valor: 75, unidad: 'mg/kg', metodo: 'Mehlich-3' });
  assert.equal(loaded.resultados.ec.valor, '');
});
