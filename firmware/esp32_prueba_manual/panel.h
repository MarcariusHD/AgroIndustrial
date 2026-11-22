#pragma once
#include <pgmspace.h>

const char PANEL_HTML[] PROGMEM = R"HTML(
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prueba del invernadero</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef3f0;color:#18372c;font-family:system-ui,sans-serif}
main{max-width:740px;margin:auto;padding:32px 20px}h1{font-size:1.9rem;margin:0 0 8px}
p{line-height:1.5}section{background:white;border:1px solid #cbdcd3;border-radius:16px;padding:20px;margin:16px 0}
h2{margin:0;font-size:1.2rem}.row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.status{font-weight:700}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
button{font:inherit;font-weight:650;border:0;border-radius:10px;padding:13px 18px;cursor:pointer;background:#1d6349;color:white;min-height:48px}
button.off{background:#e4ede8;color:#18372c}button:disabled{opacity:.45;cursor:wait}
#stop{width:100%;background:#b02c37;margin-top:10px}#connection{min-height:24px}small{color:#52665c}
</style>
</head>
<body><main>
<h1>Prueba del invernadero</h1>
<p>Control manual de la bomba y los dos coolers.</p>
<p id="connection" role="status">Conectando con el ESP32…</p>
<section><div class="row"><h2>Bomba de riego</h2><span class="status" id="bomba">Sin lectura</span></div>
<p>Relé 1 · P23. Enciende durante 2 segundos. Comprueba que haya agua disponible.</p>
<div class="actions"><button data-channel="0" data-action="on" disabled>Regar 2 segundos</button><button class="off" data-channel="0" data-action="off" disabled>Apagar bomba</button></div></section>
<section><div class="row"><h2>Cooler 1</h2><span class="status" id="cooler1">Sin lectura</span></div>
<p>Relé 2 · P25.</p>
<div class="actions"><button data-channel="1" data-action="on" disabled>Encender</button><button class="off" data-channel="1" data-action="off" disabled>Apagar</button></div></section>
<section><div class="row"><h2>Cooler 2</h2><span class="status" id="cooler2">Sin lectura</span></div>
<p>Relé 4 · P26.</p>
<div class="actions"><button data-channel="2" data-action="on" disabled>Encender</button><button class="off" data-channel="2" data-action="off" disabled>Apagar</button></div></section>
<button id="stop">Apagar todo</button>
<p><small>El estado muestra la orden del relé. Comprueba el movimiento y el flujo en los equipos. Los coolers permanecen encendidos hasta apagarlos. Al cerrar esta página pueden seguir encendidos mientras haya un equipo conectado al Wi-Fi del ESP32.</small></p>
</main>
<script>
const connection = document.getElementById('connection');
const controls = [...document.querySelectorAll('[data-channel]')];
let pending = 0;
let online = false;
let generation = 0;
function refreshButtons() {
  controls.forEach(button => { button.disabled = pending > 0 || !online; });
}
function showState(state) {
  for (const key of ['bomba', 'cooler1', 'cooler2']) {
    document.getElementById(key).textContent = state[key] ? 'Encendido' : 'Apagado';
  }
  online = true;
  connection.textContent = 'Conectado al ESP32';
}
async function request(path, options = {}) {
  const response = await fetch(path, {...options, cache: 'no-store', signal: AbortSignal.timeout(4000)});
  if (!response.ok) throw new Error('Respuesta ' + response.status);
  return response.json();
}
function showError() {
  online = false;
  connection.textContent = 'Sin confirmación. Revisa la conexión Wi-Fi. Puedes enviar X por el Monitor serie para apagar todo.';
  document.querySelectorAll('.status').forEach(label => { label.textContent = 'Sin confirmar'; });
}
async function command(path, body) {
  const version = ++generation;
  pending++;
  refreshButtons();
  try {
    const state = await request(path, {method: 'POST', body});
    if (version === generation) showState(state);
  } catch (error) {
    if (version === generation) showError();
  } finally {
    pending--;
    refreshButtons();
  }
}
controls.forEach(button => button.addEventListener('click', () => {
  command('/rele', new URLSearchParams({canal: button.dataset.channel, accion: button.dataset.action}));
}));
document.getElementById('stop').addEventListener('click', () => command('/apagar'));
async function poll() {
  const version = generation;
  if (!pending) {
    try {
      const state = await request('/estado');
      if (version === generation) showState(state);
    } catch (error) {
      if (version === generation) showError();
    }
    refreshButtons();
  }
  setTimeout(poll, 800);
}
poll();
</script></body></html>
)HTML";
