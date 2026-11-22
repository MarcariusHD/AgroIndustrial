"""Consumo registrado por dispositivo; no confundir ausencia de registros con cero."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError


def create_energy_router(get_db):
    router = APIRouter(prefix='/dashboard', tags=['Energía'])

    @router.get('/consumo-energia')
    def consumo(id_inv: int = Query(gt=0), horas: int = Query(24, ge=1, le=720), db=Depends(get_db)):
        try:
            result = db.execute(text('''
                SELECT d.id_dispositivo AS id, d.nombre, d.tipo, d.estado,
                       COUNT(c.kwh) AS registros, SUM(c.kwh) AS kwh,
                       MAX(c.fecha_hora) FILTER (WHERE c.kwh IS NOT NULL) AS ultima_lectura
                FROM dispositivo d
                LEFT JOIN consumo_energetico c ON c.id_dispositivo=d.id_dispositivo
                    AND c.fecha_hora >= LOCALTIMESTAMP - (:horas * INTERVAL '1 hour')
                    AND c.fecha_hora <= LOCALTIMESTAMP
                WHERE d.id_invernadero=:id_inv
                GROUP BY d.id_dispositivo, d.nombre, d.tipo, d.estado
                ORDER BY SUM(c.kwh) DESC NULLS LAST, d.nombre, d.id_dispositivo
            '''), {'id_inv': id_inv, 'horas': horas}).mappings().all()
            return {'dispositivos': [dict(row) for row in result], 'horas': horas}
        except SQLAlchemyError:
            raise HTTPException(503, 'No se pudo consultar el consumo energético. Intenta nuevamente.')

    return router
