#pragma once
#include <stdint.h>
struct IrrigationConfig {
  float startPercent, stopPercent;
  uint32_t pulseMs, soakMs, startupMs;
  unsigned maxPulses;
};
// Control local sin red, memoria dinamica ni esperas bloqueantes.
class Irrigation {
 public:
  constexpr explicit Irrigation(IrrigationConfig config) : cfg(config) {}
  bool pump = false;
  const char* state = "iniciando";
  unsigned pulses = 0;
  constexpr void pause(uint32_t now) { stop(now); paused = true; state = "pausado"; }
  constexpr void arm(uint32_t now) {
    if (pump) return;
    paused = false; demand = false; pulses = 0; stable = 0;
    lastStop = now; hasStopped = true;
  }
  constexpr void update(uint32_t now, float soil, bool validSoil, bool water) {
    if (paused) { stop(now); state = "pausado"; return; }
    if (!validSoil) { stop(now); stable = 0; state = "sensor_suelo_invalido"; return; }
    if (!water) { stop(now); stable = 0; state = "sin_agua"; return; }
    if (soil >= cfg.stopPercent) {
      stop(now); demand = false; pulses = 0; stable = 0;
      state = "suelo_humedo"; return;
    }
    if (soil < cfg.startPercent) demand = true;
    if (!demand) { state = "listo"; stable = 0; return; }
    if (pump) {
      if (uint32_t(now - startedAt) < cfg.pulseMs) { state = "regando"; return; }
      stop(now);
    }
    if (pulses >= cfg.maxPulses) { state = "limite_riego"; return; }
    if (now < cfg.startupMs && !startupPassed) { state = "iniciando"; return; }
    startupPassed = true;
    if (hasStopped && uint32_t(now - lastStop) < cfg.soakMs) { state = "espera_absorcion"; return; }
    if (++stable < 3) { state = "listo"; return; }
    stable = 0; pump = true; startedAt = now; ++pulses; state = "regando";
  }
 private:
  IrrigationConfig cfg;
  bool demand = false, paused = false, hasStopped = false, startupPassed = false;
  unsigned stable = 0;
  uint32_t startedAt = 0, lastStop = 0;
  constexpr void stop(uint32_t now) {
    if (pump) { lastStop = now; hasStopped = true; }
    pump = false;
  }
};
