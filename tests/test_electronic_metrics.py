import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from pydantic import ValidationError
from electronic_metrics import ElectronicConfig, integrate, create_electronic_router
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import Column, Integer, String, JSON, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base
from esp32_api import LecturaESP32

class Device(Base):
    __tablename__ = 'dispositivo'
    __table_args__ = {'extend_existing': True}
    id_dispositivo = Column(Integer, primary_key=True)
    nombre = Column(String)
    tipo = Column(String)
    estado = Column(String)
    id_invernadero = Column(Integer)
    config_electronica = Column(JSON)

class MetricsTests(unittest.TestCase):
    def test_integral_excludes_missing_unknown_and_simulation(self):
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        def row(s, active, sim=False):
            return SimpleNamespace(recibido_en=start + timedelta(seconds=s), rele_activado=active, simulado=sim)
        rows = [row(0, True), row(2, False), row(12, False), row(100, True), row(102, None)]
        self.assertEqual(integrate(rows, start, start + timedelta(seconds=120), 'rele'), (2, 12))
        self.assertEqual(integrate([row(0, True, True), row(2, False)], start, start + timedelta(seconds=10), 'rele'), (0, 0))
        self.assertEqual(integrate([row(0, False), row(2, False)], start, start + timedelta(seconds=10), 'rele'), (0, 2))

    def test_window_clips_without_tail_extrapolation(self):
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        rows = [SimpleNamespace(recibido_en=start + timedelta(seconds=s), rele_activado=True, simulado=False) for s in (-5, 5, 15)]
        self.assertEqual(integrate(rows, start, start + timedelta(seconds=12), 'continuo'), (12, 12))
        self.assertEqual(integrate(rows[:1], start, start + timedelta(hours=1), 'continuo'), (0, 0))

    def test_config_rejects_bad_numbers_and_unknown_modes(self):
        for data in ({'potencia_w': -1}, {'corriente_ma': float('inf')}, {'pin': 40}, {'uso': 'inventado'}, {'fuente_esp32': 0}):
            with self.assertRaises(ValidationError): ElectronicConfig(**data)

    def test_summary_from_real_history(self):
        engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Base.metadata.create_all(engine, tables=[Device.__table__, LecturaESP32.__table__])
        sessions = sessionmaker(bind=engine)
        now = datetime.now(timezone.utc)
        with sessions() as db:
            db.add_all([Device(id_dispositivo=26, nombre='ESP32', tipo='ESP32', id_invernadero=3),
                Device(id_dispositivo=25, nombre='Bomba', tipo='Bomba de Agua', id_invernadero=3,
                    config_electronica={'fuente_esp32': 26, 'uso': 'rele', 'metrica': 'rele_activado', 'voltaje_v': 5, 'corriente_ma': 300}),
                Device(id_dispositivo=99, nombre='Otro', tipo='Sensor', id_invernadero=4)])
            db.add_all([LecturaESP32(id_dispositivo=26, suelo_adc=2000, agua_adc=1500,
                simulado=False, rele_activado=active, recibido_en=now-timedelta(seconds=secs))
                for secs, active in [(5, True), (3, False)]])
            db.commit()
        def get_db():
            with sessions() as db: yield db
        app = FastAPI()
        app.include_router(create_electronic_router(get_db, Device))
        with TestClient(app) as client:
            response = client.get('/dashboard/componentes-telemetria?id_inv=3')
            self.assertEqual(response.status_code, 200, response.text)
            rows = response.json()['componentes']
            self.assertEqual(len(rows), 2)
            pump = next(r for r in rows if r['id'] == 25)
            self.assertEqual(pump['potencia_w'], 1.5)
            self.assertEqual(pump['segundos_estimados'], 2)
            self.assertAlmostEqual(pump['kwh_estimados'], 1.5 * 2 / 3600000)
            self.assertFalse(pump['valor'])
            self.assertEqual(len(pump['sensores_reportados']), 2)
            self.assertIsNone(next(r for r in rows if r['id'] == 26)['kwh_estimados'])
        engine.dispose()

if __name__ == '__main__': unittest.main()
