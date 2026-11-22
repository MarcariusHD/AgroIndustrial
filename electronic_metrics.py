"""Inventario enlazado a telemetria y energia estimada, nunca medicion electrica."""
from datetime import datetime, timedelta, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from fastapi import APIRouter, Depends, Query
from esp32_api import LecturaESP32

class ElectronicConfig(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)
    fuente_esp32: int | None = Field(default=None, gt=0)
    metrica: Literal['controlador', 'humedad_suelo', 'agua_detectada', 'rele_activado', 'ninguna'] = 'ninguna'
    pin: int | None = Field(default=None, ge=0, le=39)
    voltaje_v: float | None = Field(default=None, gt=0, le=1000)
    corriente_ma: float | None = Field(default=None, gt=0, le=100000)
    potencia_w: float | None = Field(default=None, gt=0, le=100000)
    uso: Literal['sin_estimar', 'continuo', 'rele'] = 'sin_estimar'

def utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)

def integrate(rows, start, end, mode):
    """Retencion de orden anterior solo entre dos muestras separadas <=15 s."""
    seconds = covered = 0.0
    previous = None
    for row in rows:
        if previous is not None:
            a, b = utc(previous.recibido_en), utc(row.recibido_en)
            gap = (b - a).total_seconds()
            duration = max(0, (min(b, end) - max(a, start)).total_seconds())
            known = mode == 'continuo' or (previous.rele_activado is not None and row.rele_activado is not None)
            if 0 < gap <= 15 and known and not previous.simulado and not row.simulado:
                covered += duration
                if mode == 'continuo' or previous.rele_activado:
                    seconds += duration
        previous = row
    return seconds, covered

def create_electronic_router(get_db, device_model):
    router = APIRouter(prefix='/dashboard', tags=['Componentes electrónicos'])

    @router.get('/componentes-telemetria')
    def summary(id_inv: int = Query(gt=0), horas: int = Query(24, ge=1, le=720), db=Depends(get_db)):
        end = datetime.now(timezone.utc)
        start = end - timedelta(hours=horas)
        devices = db.query(device_model).filter_by(id_invernadero=id_inv).all()
        by_id = {d.id_dispositivo: d for d in devices}
        cache = {}
        results = []
        for device in devices:
            config = ElectronicConfig.model_validate(device.config_electronica or {})
            source = config.fuente_esp32 or (device.id_dispositivo if device.tipo.upper() == 'ESP32' else None)
            latest = None
            seconds = covered = 0.0
            reason = None
            if source not in by_id or by_id[source].tipo.upper() != 'ESP32':
                reason = 'Vincula un ESP32 del mismo invernadero'
            else:
                if source not in cache:
                    query = db.query(LecturaESP32).filter_by(id_dispositivo=source, simulado=False)
                    latest_row = query.order_by(LecturaESP32.recibido_en.desc(), LecturaESP32.id.desc()).first()
                    times = {}
                    for mode in ('continuo', 'rele'):
                        rows = query.filter(LecturaESP32.recibido_en >= start - timedelta(seconds=15),
                                            LecturaESP32.recibido_en <= end).order_by(
                                                LecturaESP32.recibido_en, LecturaESP32.id).yield_per(1000)
                        times[mode] = integrate(rows, start, end, mode)
                    cache[source] = (latest_row, times)
                latest, times = cache[source]
                if config.uso != 'sin_estimar':
                    seconds, covered = times[config.uso]
                if not latest:
                    reason = 'Sin lecturas reales del ESP32'
            power = config.potencia_w
            if power is None and config.voltaje_v is not None and config.corriente_ma is not None:
                power = config.voltaje_v * config.corriente_ma / 1000
            if not reason and config.uso == 'sin_estimar': reason = 'Estimación deshabilitada'
            if not reason and power is None: reason = 'Configura potencia W o voltaje V y corriente mA'
            if not reason and covered == 0: reason = 'Sin intervalos válidos en este periodo'
            fresh = latest is not None and (end - utc(latest.recibido_en)).total_seconds() <= 30
            metric = config.metrica
            value = getattr(latest, metric, None) if latest and metric not in ('ninguna', 'controlador') else None
            results.append(dict(id=device.id_dispositivo, nombre=device.nombre, tipo=device.tipo,
                estado_registro=device.estado, fuente_esp32=source, configuracion=config.model_dump(),
                reciente=fresh, ultima_lectura=utc(latest.recibido_en) if latest else None,
                valor=value, potencia_w=power, segundos_estimados=seconds if covered else None,
                cobertura_segundos=covered, kwh_estimados=power * seconds / 3600000 if not reason else None,
                motivo=reason,
                sensores_reportados=([field for field in ('suelo_adc', 'agua_adc', 'temperatura', 'humedad', 'luz_adc')
                                     if getattr(latest, field) is not None] if latest else [])))
        return {'componentes': results, 'horas': horas, 'desde': start, 'hasta': end,
                'formula': 'kWh = potencia (W) × segundos estimados / 3 600 000',
                'metodo': 'Potencia configurada actual. Orden anterior entre muestras reales separadas como máximo 15 s. Sin extrapolar cortes de red ni confirmar movimiento del motor.'}
    return router
