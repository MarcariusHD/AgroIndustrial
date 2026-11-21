#pragma once
#include "irrigation.h"
// Pruebas evaluadas por el compilador: no accionan hardware ni agregan tareas.
namespace IrrigationChecks {
constexpr IrrigationConfig cfg{30, 60, 2000, 30000, 5000, 3};
constexpr bool equal(const char* a, const char* b) {
  while (*a && *a == *b) { ++a; ++b; }
  return *a == *b;
}
constexpr bool startAndStop() {
  Irrigation c(cfg);
  c.update(100, 10, true, true);
  if (c.pump) return false;
  c.update(5000, 10, true, true);
  c.update(5100, 10, true, true);
  c.update(5200, 10, true, true);
  if (!c.pump) return false;
  c.update(5300, 40, true, true); // Histeresis: no parar antes del limite superior.
  if (!c.pump) return false;
  c.update(5400, 60, true, true);
  return !c.pump && equal(c.state, "suelo_humedo");
}
constexpr bool waterAndFaultStop() {
  Irrigation c(cfg);
  for (uint32_t t = 5000; t <= 5200; t += 100) c.update(t, 10, true, true);
  c.update(5300, 10, true, false);
  if (c.pump || !equal(c.state, "sin_agua")) return false;
  c.update(5400, 10, true, true);
  if (c.pump) return false; // No reiniciar al instante al volver el agua.
  for (uint32_t t = 35300; t <= 35500; t += 100) c.update(t, 10, true, true);
  if (!c.pump) return false;
  c.update(35600, 10, false, true);
  return !c.pump && equal(c.state, "sensor_suelo_invalido");
}
constexpr bool budgetAndPause() {
  Irrigation c(cfg);
  for (uint32_t t = 5000; t <= 100000; t += 100) c.update(t, 10, true, true);
  if (c.pump || c.pulses != 3 || !equal(c.state, "limite_riego")) return false;
  c.arm(100000);
  c.update(100100, 10, true, true);
  if (c.pump) return false;
  for (uint32_t t = 130000; t <= 130200; t += 100) c.update(t, 10, true, true);
  if (!c.pump) return false;
  c.pause(130201);
  c.update(200000, 10, true, true);
  return !c.pump && equal(c.state, "pausado");
}
constexpr bool timeoutAndWrap() {
  Irrigation c(cfg);
  c.update(0xffffff00U, 10, true, true);
  c.update(0xffffff64U, 10, true, true);
  c.update(0xffffffc8U, 10, true, true);
  if (!c.pump) return false;
  c.update(1944U, 10, true, true); // 2000 ms despues, tras rollover.
  if (c.pump || !equal(c.state, "espera_absorcion")) return false;
  c.update(1945U, 10, true, true);
  return !c.pump;
}
static_assert(startAndStop(), "Fallo arranque/humedad/histeresis");
static_assert(waterAndFaultStop(), "Fallo corte por agua/sensor");
static_assert(budgetAndPause(), "Fallo limite/rearme/pausa");
static_assert(timeoutAndWrap(), "Fallo temporizador/rollover");
}
