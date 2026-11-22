import { useState, useEffect } from 'react';
import Modal from './Modal';
import { fieldExamples, resultExamples, methodExamples, allowedUnits, isDecimalInput, validateSoilForm } from './soilValidation';
import { identificationFields, physicalFields, labFields, interpretationFields, laboratoryParameters, exchangeParameters, emptySoilForm, loadSoilForm, soilPayload } from './soilForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const inputClass = 'w-full min-w-0 p-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-emerald-500 disabled:text-gray-600 disabled:bg-gray-100';

export default function SoilAnalysisModal({ isOpen, onClose, greenhouseId, isForced = false }) {
  const [formData, setFormData] = useState(emptySoilForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [inputHints, setInputHints] = useState({});
  const errors = validateSoilForm(formData);
  const [legacy, setLegacy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setTouched({});
      setSubmitted(false);
      setInputHints({});
      setStatusMessage(null);
      setLoadError(false);
      setIsEditing(false);
      setFormData(emptySoilForm());
      try {
        if (!greenhouseId) throw new Error('No se ha seleccionado un invernadero.');
        const response = await fetch(`${API_BASE_URL}/invernaderos/${greenhouseId}/analisis-suelo`, { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo cargar el análisis. Reintenta antes de editar.');
        const data = await response.json();
        if (controller.signal.aborted) return;
        setFormData(loadSoilForm(data));
        setLegacy(Boolean(data && !data.formulario));
        setIsEditing(!data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(true);
        setStatusMessage({ type: 'error', text: error.message });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [isOpen, greenhouseId, retry]);

  function changeField(event) {
    const { name } = event.target;
    let { value } = event.target;
    if (event.target.dataset.numeric === 'true') {
      if (!isDecimalInput(value)) {
        setInputHints(previous => ({ ...previous, [name]: 'Solo números y separador decimal. Ejemplo: 1.5.' }));
        return;
      }
      value = value.replace(',', '.');
    }
    setInputHints(previous => ({ ...previous, [name]: null }));
    setFormData(previous => ({ ...previous, [name]: value }));
    setStatusMessage(null);
  }
  function changeResult(key, field, value) {
    const name = `resultados.${key}.${field}`;
    if (field === 'valor') {
      if (!isDecimalInput(value)) {
        setInputHints(previous => ({ ...previous, [name]: 'Solo números y separador decimal.' }));
        return;
      }
      value = value.replace(',', '.');
    }
    setInputHints(previous => ({ ...previous, [name]: null }));
    setFormData(previous => ({ ...previous, resultados: { ...previous.resultados, [key]: { ...previous.resultados[key], [field]: value } } }));
    setStatusMessage(null);
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || loading || loadError || !isEditing) return;
    setSubmitted(true);
    if (Object.keys(errors).length) {
      setStatusMessage({ type: 'error', text: 'Revisa los campos marcados en rojo antes de guardar.' });
      document.getElementById(`soil-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    const payload = soilPayload(formData);
    setSaving(true);
    setStatusMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/invernaderos/${greenhouseId}/analisis-suelo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = Array.isArray(body.detail) ? body.detail.map(item => `${item.loc.slice(1).join('.')}: ${item.msg}`).join('; ') : body.detail;
        throw new Error(detail || 'No se pudo guardar el análisis.');
      }
      const saved = await response.json();
      if (saved.formulario) setFormData(loadSoilForm(saved));
      setIsEditing(false);
      setSubmitted(false);
      setTouched({});
      setLegacy(false);
      setStatusMessage({ type: 'success', text: 'Análisis de suelo guardado exitosamente.' });
      if (isForced) onClose();
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Error de red. Intenta nuevamente.' });
    } finally {
      setSaving(false);
    }
  }
  function feedback(name, example) {
    const error = inputHints[name] || ((submitted || touched[name]) && errors[name]);
    return <div id={`soil-${name}-help`}>
      <p className="mt-1 text-xs text-gray-500">Ejemplo: {example}</p>
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{error}</p>}
    </div>;
  }
  function fieldProps(name) {
    const invalid = Boolean(inputHints[name] || ((submitted || touched[name]) && errors[name]));
    return { id: `soil-${name}`, name, 'aria-invalid': invalid, 'aria-describedby': `soil-${name}-help`,
      onBlur: () => setTouched(previous => ({ ...previous, [name]: true })),
      className: `${inputClass} ${invalid ? 'border-red-500 bg-red-50' : ''}` };
  }
  function renderFields(fields) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{fields.map(field => {
      const props = { ...fieldProps(field.name), value: formData[field.name], onChange: changeField, disabled: !isEditing || saving, required: field.required };
      return <div key={field.name} className={field.multiline ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
        <label htmlFor={props.id} className="block text-xs font-bold text-gray-600">{field.label}{field.required && ' *'}</label>
        {field.options ? <select {...props}><option value="">Sin registrar</option>{field.options.map(option => <option key={option}>{option}</option>)}</select>
          : field.multiline ? <textarea {...props} placeholder={`Ej.: ${fieldExamples[field.name]}`} rows={2} maxLength={2000} />
          : <input {...props} type={field.type === 'number' ? 'text' : field.type || 'text'} data-numeric={field.type === 'number'} inputMode={field.type === 'number' ? 'decimal' : undefined} maxLength={field.maxLength || 500} placeholder={`Ej.: ${fieldExamples[field.name]}`} />}
        {feedback(field.name, fieldExamples[field.name])}
      </div>;
    })}</div>;
  }
  function renderResults(parameters, methodLabel) {
    return <div className="space-y-4">{parameters.map(([key, label]) => {
      const reading = formData.resultados[key];
      const prefix = `resultados.${key}`;
      return <fieldset key={key} className="rounded-xl border border-gray-200 p-3" disabled={!isEditing || saving}>
        <legend className="px-2 text-sm font-bold text-gray-700">{label}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label htmlFor={`soil-${prefix}.valor`} className="text-xs text-gray-600">Resultado</label>
            <input {...fieldProps(`${prefix}.valor`)} type="text" inputMode="decimal" maxLength={20} value={reading.valor} placeholder={`Ej.: ${resultExamples[key]}`} onChange={e => changeResult(key, 'valor', e.target.value)} />
            {feedback(`${prefix}.valor`, resultExamples[key])}</div>
          <div><label htmlFor={`soil-${prefix}.unidad`} className="text-xs text-gray-600">Unidad</label>
            <select {...fieldProps(`${prefix}.unidad`)} value={reading.unidad} onChange={e => changeResult(key, 'unidad', e.target.value)}>
              {!allowedUnits(key).includes(reading.unidad) && <option value={reading.unidad}>{reading.unidad || 'Selecciona una unidad'} (revisar)</option>}
              {allowedUnits(key).map(unit => <option key={unit}>{unit}</option>)}
            </select>{feedback(`${prefix}.unidad`, allowedUnits(key)[0])}</div>
          <div><label htmlFor={`soil-${prefix}.metodo`} className="text-xs text-gray-600">{methodLabel}{reading.valor !== '' && ' *'}</label>
            <input {...fieldProps(`${prefix}.metodo`)} maxLength={500} value={reading.metodo} placeholder={`Ej.: ${methodExamples[key]}`} onChange={e => changeResult(key, 'metodo', e.target.value)} />
            {feedback(`${prefix}.metodo`, methodExamples[key])}</div>
        </div>
      </fieldset>;
    })}</div>;
  }
  function section(title, content) {
    return <section className="space-y-4"><h3 className="text-sm font-black text-[#207b25] border-b-2 border-gray-100 pb-3">{title}</h3>{content}</section>;
  }
  return <Modal isOpen={isOpen} onClose={onClose} title="Análisis de Suelos y Nutrientes" subtitle="Formulario de análisis de suelo agrícola" maxWidth="max-w-5xl" isClosable={!isForced && !saving}>
    <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
      {statusMessage && <div role={statusMessage.type === 'error' ? 'alert' : 'status'} className={`mb-4 p-4 rounded-xl text-sm ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{statusMessage.text}</div>}
      {loading ? <p role="status">Cargando análisis…</p> : loadError ? <button type="button" onClick={() => setRetry(value => value + 1)} className={inputClass}>Reintentar carga</button> : <form noValidate onSubmit={handleSubmit} className="space-y-8">
        <p className="text-sm text-gray-500">Los campos con * son obligatorios. Los ejemplos son orientativos: transcribe los datos reales de tu informe. Deja vacíos los resultados no analizados: se registran como “No determinado”, sin asignarles cero. {!isEditing && 'Modo solo lectura.'}</p>
        {legacy && <p className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">Análisis anterior: verifica las unidades, los métodos y la profundidad con el informe original. El antiguo nitrógeno en ppm no se ha convertido a las nuevas formas de nitrógeno. Los datos históricos se conservan.</p>}
        {section('1. Identificación y muestreo', renderFields(identificationFields))}
        {section('2. Condiciones y propiedades físicas', renderFields(physicalFields))}
        {section('3. Resultados de laboratorio', <>{renderFields(labFields)}<p className="text-xs text-gray-500">Conserva las unidades del informe del laboratorio. Si difieren de las indicadas, modifica la unidad antes de ingresar el resultado.</p>{renderResults(laboratoryParameters, 'Método / Extracto')}</>)}
        {section('4. Capacidad de intercambio y saturación', renderResults(exchangeParameters, 'Método / Base de cálculo'))}
        {section('5. Interpretación agronómica', renderFields(interpretationFields))}
        <div className="flex flex-wrap gap-3 sticky bottom-0 bg-white py-3 border-t border-gray-100">
          {isEditing ? <button type="submit" disabled={saving} className="flex-1 p-4 bg-[#207b25] text-white rounded-xl font-bold disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
            : <button type="button" onClick={() => setIsEditing(true)} className="flex-1 p-4 bg-[#207b25] text-white rounded-xl font-bold">Editar análisis de suelo</button>}
          <button type="button" disabled={saving} onClick={onClose} className="p-4 bg-gray-100 text-gray-600 rounded-xl font-bold">{isForced ? 'Saltar' : 'Cerrar'}</button>
        </div>
      </form>}
    </div>
  </Modal>;
}
