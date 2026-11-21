"""Ingesta ESP32 independiente del esquema legado de sensores."""
import os
import secrets
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Index, Integer, String, func, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from database import Base


class LecturaESP32(Base):
    __tablename__ = 'lectura_esp32'
    id = Column(Integer, primary_key=True)
    id_dispositivo = Column(Integer, ForeignKey('dispositivo.id_dispositivo'), nullable=False)
    temperatura_exterior = Column(Float, nullable=True)
    humedad_exterior = Column(Float, nullable=True)
    suelo2_adc = Column(Integer, nullable=True)
    lluvia_detectada = Column(Boolean, nullable=True)
    temperatura = Column(Float, nullable=True)
    humedad = Column(Float, nullable=True)
    luz_adc = Column(Integer, nullable=True)
    suelo_adc = Column(Integer, nullable=True)
    humedad_suelo = Column(Float, nullable=True)
    suelo_seco = Column(Boolean, nullable=True)
    agua_adc = Column(Integer, nullable=True)
    agua_detectada = Column(Boolean, nullable=True)
    ventilador1_activado = Column(Boolean, nullable=True)
    ventilador2_activado = Column(Boolean, nullable=True)
    rele_activado = Column(Boolean, nullable=True)
    estado_riego = Column(String(32), nullable=True)
    simulado = Column(Boolean, nullable=False)
    recibido_en = Column(DateTime(timezone=True), nullable=False)
    __table_args__ = (Index('ix_esp32_dispositivo_id', 'id_dispositivo', 'id'),)


class LecturaEntrada(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)
    id_dispositivo: int = Field(gt=0, strict=True)
    temperatura_exterior: float | None = Field(default=None, ge=-40, le=80)
    humedad_exterior: float | None = Field(default=None, ge=0, le=100)
    suelo2_adc: int | None = Field(default=None, ge=0, le=4095, strict=True)
    lluvia_detectada: bool | None = Field(default=None, strict=True)
    temperatura: float | None = Field(default=None, ge=-40, le=80)
    humedad: float | None = Field(default=None, ge=0, le=100)
    luz_adc: int | None = Field(default=None, ge=0, le=4095, strict=True)
    suelo_adc: int | None = Field(default=None, ge=0, le=4095, strict=True)
    humedad_suelo: float | None = Field(default=None, ge=0, le=100)
    suelo_seco: bool | None = Field(default=None, strict=True)
    agua_adc: int | None = Field(default=None, ge=0, le=4095, strict=True)
    agua_detectada: bool | None = Field(default=None, strict=True)
    ventilador1_activado: bool | None = Field(default=None, strict=True)
    ventilador2_activado: bool | None = Field(default=None, strict=True)
    rele_activado: bool | None = Field(default=None, strict=True)
    estado_riego: Literal['iniciando', 'pausado', 'sin_agua', 'sensor_suelo_invalido',
                         'suelo_humedo', 'listo', 'regando', 'espera_absorcion',
                         'limite_riego'] | None = None
    simulado: bool = Field(strict=True)

    @model_validator(mode='after')
    def requiere_sensor(self):
        if all(getattr(self, field) is None for field in (
            'temperatura_exterior', 'humedad_exterior', 'suelo2_adc', 'lluvia_detectada',
            'temperatura', 'humedad', 'luz_adc', 'suelo_adc',
            'humedad_suelo', 'suelo_seco', 'agua_adc', 'agua_detectada',
        )):
            raise ValueError('Se requiere al menos una lectura de sensor')
        return self


class LecturaSalida(LecturaEntrada):
    model_config = ConfigDict(from_attributes=True)
    id: int
    recibido_en: datetime


def ensure_fan_columns(engine):
    """Actualizar instalaciones existentes conservando sus lecturas anteriores."""
    with engine.begin() as connection:
        columns = {column['name'] for column in inspect(connection).get_columns('lectura_esp32')}
        for name in ('ventilador1_activado', 'ventilador2_activado'):
            if name not in columns:
                optional = 'IF NOT EXISTS ' if engine.dialect.name == 'postgresql' else ''
                connection.execute(text(f'ALTER TABLE lectura_esp32 ADD COLUMN {optional}{name} BOOLEAN'))


def create_router(get_db, dispositivo_model):
    router = APIRouter(prefix='/api/esp32', tags=['ESP32'])

    @router.get('/invernaderos/{greenhouse_id}/lecturas', response_model=list[LecturaSalida])
    def lecturas_invernadero(greenhouse_id: int, db=Depends(get_db)):
        # Una lectura real por dispositivo, sin mezclar otros invernaderos ni simulaciones.
        latest_ids = (db.query(func.max(LecturaESP32.id).label('id'))
                      .join(dispositivo_model, dispositivo_model.id_dispositivo == LecturaESP32.id_dispositivo)
                      .filter(dispositivo_model.id_invernadero == greenhouse_id,
                              LecturaESP32.simulado.is_(False))
                      .group_by(LecturaESP32.id_dispositivo).subquery())
        return (db.query(LecturaESP32).join(latest_ids, LecturaESP32.id == latest_ids.c.id)
                .order_by(LecturaESP32.id.desc()).all())

    def device(db, device_id):
        result = db.get(dispositivo_model, device_id)
        if result is None:
            raise HTTPException(404, 'Dispositivo no registrado')
        return result

    @router.post('/lecturas', response_model=LecturaSalida, status_code=201)
    def recibir(body: LecturaEntrada, db=Depends(get_db), x_api_key: str = Header(default='')):
        key = os.getenv('ESP32_API_KEY', '')
        if not key:
            raise HTTPException(503, 'Configure ESP32_API_KEY en el servidor')
        if not secrets.compare_digest(x_api_key.encode(), key.encode()):
            raise HTTPException(401, 'Clave de dispositivo incorrecta')
        device(db, body.id_dispositivo)
        reading = LecturaESP32(**body.model_dump(), recibido_en=datetime.now(timezone.utc))
        try:
            db.add(reading)
            db.commit()
            db.refresh(reading)
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(503, 'No se pudo guardar la lectura')
        return reading

    @router.get('/dispositivos/{device_id}/ultima', response_model=LecturaSalida | None)
    def ultima(device_id: int, db=Depends(get_db)):
        device(db, device_id)
        return db.query(LecturaESP32).filter_by(id_dispositivo=device_id).order_by(LecturaESP32.id.desc()).first()

    @router.get('/dispositivos/{device_id}/historial', response_model=list[LecturaSalida])
    def historial(device_id: int, limite: int = Query(50, ge=1, le=500),
                  antes_de: int | None = Query(None, gt=0),
                  modo: Literal['todos', 'simulado', 'real'] = 'todos', db=Depends(get_db)):
        device(db, device_id)
        query = db.query(LecturaESP32).filter_by(id_dispositivo=device_id)
        if antes_de is not None:
            query = query.filter(LecturaESP32.id < antes_de)
        if modo != 'todos':
            query = query.filter_by(simulado=modo == 'simulado')
        return query.order_by(LecturaESP32.id.desc()).limit(limite).all()

    return router
