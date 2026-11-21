import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptySoilForm, allFields, allParameters } from './soilForm.js';
import { validateSoilForm, isDecimalInput, fieldExamples, resultExamples, methodExamples, allowedUnits } from './soilValidation.js';

function validForm() {
  return { ...emptySoilForm(), numero_muestra: 'M-001', fecha_muestreo: '2026-10-06', lote_sector: 'Norte', cultivo: 'Tomate' };
}
test('cada campo y cada medición tienen ejemplos', () => {
  for (const field of allFields) assert.ok(fieldExamples[field.name], field.name);
  for (const [key] of allParameters) {
    assert.ok(resultExamples[key], key);
    assert.ok(methodExamples[key], key);
  }
});
test('bloquea letras, exponentes y símbolos en números; acepta coma decimal', () => {
  for (const input of ['abc', '-2', '1e3', '12 kg', '<script>']) assert.equal(isDecimalInput(input), false);
  for (const input of ['', '0', '1.5', '1,5', '20']) assert.equal(isDecimalInput(input), true);
});
test('valida requeridos, coordenadas, fechas, porcentajes, intervalos y enteros', () => {
  assert.deepEqual(validateSoilForm(validForm()), {});
  const invalid = { ...validForm(), numero_muestra: ' ', geolocalizacion: '100, -181', profundidad_desde: '30', profundidad_hasta: '20', numero_submuestras: '2.5', arena: '60', limo: '40', arcilla: '20', fecha_informe: '2026-10-01', laboratorio: '123', cultivo: '<b>Tomate</b>' };
  const errors = validateSoilForm(invalid);
  for (const key of ['numero_muestra', 'geolocalizacion', 'profundidad_hasta', 'numero_submuestras', 'arcilla', 'fecha_informe', 'laboratorio', 'cultivo']) assert.ok(errors[key], key);
});
test('resultado exige método y unidad compatible; cero es válido', () => {
  const form = validForm();
  form.resultados.ph = { valor: '0', unidad: 'Sin unidad', metodo: 'Agua 1:1' };
  assert.deepEqual(validateSoilForm(form), {});
  form.resultados.ph = { valor: '15', unidad: 'ppm', metodo: '' };
  const errors = validateSoilForm(form);
  for (const suffix of ['valor', 'unidad', 'metodo']) assert.ok(errors[`resultados.ph.${suffix}`]);
});
test('todos los ejemplos forman un formulario válido', () => {
  const form = { ...emptySoilForm(), ...fieldExamples };
  for (const [key] of allParameters) form.resultados[key] = { valor: resultExamples[key], unidad: allowedUnits(key)[0], metodo: methodExamples[key] };
  assert.deepEqual(validateSoilForm(form), {});
});
