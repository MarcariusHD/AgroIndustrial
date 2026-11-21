import os
import unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import Column, Integer, create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base
from esp32_api import LecturaESP32, create_router, ensure_fan_columns


class Device(Base):
    __tablename__ = 'dispositivo'
    id_dispositivo = Column(Integer, primary_key=True)
    id_invernadero = Column(Integer)


class Esp32Tests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine, tables=[Device.__table__, LecturaESP32.__table__])
        sessions = sessionmaker(bind=self.engine)
        with sessions() as db:
            db.add_all([Device(id_dispositivo=1, id_invernadero=10), Device(id_dispositivo=2, id_invernadero=20)])
            db.commit()
        def get_db():
            with sessions() as db:
                yield db
        app = FastAPI()
        app.include_router(create_router(get_db, Device))
        self.client = TestClient(app)
        self.env = patch.dict(os.environ, ESP32_API_KEY='test-key')
        self.env.start()
        self.body = dict(id_dispositivo=1, temperatura=24.5, humedad=60, luz_adc=1234, simulado=True)

    def tearDown(self):
        self.client.close()
        self.engine.dispose()
        self.env.stop()

    def post(self, **changes):
        return self.client.post('/api/esp32/lecturas', json=self.body | changes, headers={'X-API-Key': 'test-key'})

    def test_fan_states_roundtrip_and_legacy(self):
        old = self.post().json()
        self.assertIsNone(old['ventilador1_activado'])
        self.assertIsNone(old['ventilador2_activado'])
        response = self.post(simulado=False, ventilador1_activado=True, ventilador2_activado=False)
        self.assertEqual(response.status_code, 201, response.text)
        latest = self.client.get('/api/esp32/dispositivos/1/ultima').json()
        self.assertTrue(latest['ventilador1_activado'])
        self.assertFalse(latest['ventilador2_activado'])
        self.assertEqual(self.post(ventilador1_activado='on').status_code, 422)

    def test_upgrade_existing_table_preserves_readings_and_is_repeatable(self):
        engine = create_engine('sqlite://')
        with engine.begin() as connection:
            connection.execute(text('CREATE TABLE lectura_esp32 (id INTEGER PRIMARY KEY, temperatura FLOAT)'))
            connection.execute(text('INSERT INTO lectura_esp32 VALUES (1, 18.5)'))
        ensure_fan_columns(engine)
        ensure_fan_columns(engine)
        self.assertIn('ventilador2_activado', {column['name'] for column in inspect(engine).get_columns('lectura_esp32')})
        with engine.connect() as connection:
            row = connection.execute(text('SELECT temperatura, ventilador1_activado FROM lectura_esp32')).one()
            self.assertEqual(row, (18.5, None))
        engine.dispose()

    def test_roundtrip_and_pagination(self):
        self.assertIsNone(self.client.get('/api/esp32/dispositivos/1/ultima').json())
        first = self.post().json()
        self.assertEqual(self.post(simulado=False).status_code, 201)
        latest = self.client.get('/api/esp32/dispositivos/1/ultima').json()
        self.assertFalse(latest['simulado'])
        rows = self.client.get('/api/esp32/dispositivos/1/historial', params={'antes_de': latest['id']}).json()
        self.assertEqual([r['id'] for r in rows], [first['id']])
        self.assertEqual(len(self.client.get('/api/esp32/dispositivos/1/historial?modo=real').json()), 1)
        self.assertEqual(self.client.get('/api/esp32/dispositivos/2/historial').json(), [])

    def test_reject_bad_key_and_missing_config(self):
        self.assertEqual(self.client.post('/api/esp32/lecturas', json=self.body).status_code, 401)
        with patch.dict(os.environ, ESP32_API_KEY=''):
            self.assertEqual(self.post().status_code, 503)

    def test_greenhouse_readings_are_latest_real_and_isolated(self):
        self.post(simulado=False, humedad_suelo=20)
        latest = self.post(simulado=False, humedad_suelo=0, agua_adc=0).json()
        self.post(simulado=True, humedad_suelo=90)
        self.post(id_dispositivo=2, simulado=False, humedad_suelo=75)
        rows = self.client.get('/api/esp32/invernaderos/10/lecturas').json()
        self.assertEqual([row['id'] for row in rows], [latest['id']])
        self.assertEqual(rows[0]['humedad_suelo'], 0)
        self.assertEqual(rows[0]['agua_adc'], 0)
        self.assertEqual(self.client.get('/api/esp32/invernaderos/999/lecturas').json(), [])

    def test_unknown_device(self):
        self.assertEqual(self.post(id_dispositivo=999).status_code, 404)
        self.assertEqual(self.client.get('/api/esp32/dispositivos/999/ultima').status_code, 404)

    def test_ranges_and_payload(self):
        for changes in [dict(humedad=101), dict(temperatura=-41), dict(luz_adc=4096), dict(luz_adc=1.5), dict(simulado='true'), dict(extra=1)]:
            with self.subTest(changes=changes):
                self.assertEqual(self.post(**changes).status_code, 422)
        self.assertEqual(self.client.get('/api/esp32/dispositivos/1/historial?limite=501').status_code, 422)
        self.assertEqual(self.client.get('/api/esp32/dispositivos/1/historial').json(), [])

    def test_ldr_only_preserves_zero_and_missing_sensors(self):
        response = self.client.post('/api/esp32/lecturas', json={
            'id_dispositivo': 1, 'luz_adc': 0, 'simulado': False,
        }, headers={'X-API-Key': 'test-key'})
        self.assertEqual(response.status_code, 201, response.text)
        latest = self.client.get('/api/esp32/dispositivos/1/ultima').json()
        self.assertEqual(latest['luz_adc'], 0)
        self.assertIsNone(latest['temperatura'])
        self.assertIsNone(latest['humedad'])
        self.assertFalse(latest['simulado'])
        rows = self.client.get('/api/esp32/dispositivos/1/historial?modo=real').json()
        self.assertEqual(len(rows), 1)
        self.assertIsNone(rows[0]['temperatura'])

    def test_soil_water_roundtrip_without_old_sensors(self):
        for values in [dict(suelo_adc=0, agua_adc=4095, humedad_suelo=0, rele_activado=False),
                       dict(suelo_seco=False, agua_detectada=False)]:
            body = dict(id_dispositivo=1, simulado=False, **values)
            response = self.client.post('/api/esp32/lecturas', json=body,
                                        headers={'X-API-Key': 'test-key'})
            self.assertEqual(response.status_code, 201, response.text)
            latest = self.client.get('/api/esp32/dispositivos/1/ultima').json()
            for key, value in values.items():
                self.assertEqual(latest[key], value)
            for key in ['temperatura', 'humedad', 'luz_adc']:
                self.assertIsNone(latest[key])
            rows = self.client.get('/api/esp32/dispositivos/1/historial?modo=real').json()
            self.assertEqual(rows[0]['id'], latest['id'])

    def test_new_sensor_validation(self):
        for changes in [dict(suelo_adc=-1), dict(agua_adc=4096), dict(suelo_adc=1.5),
                        dict(humedad_suelo=101), dict(humedad_suelo=-1),
                        dict(agua_detectada='false'), dict(rele_activado=1)]:
            with self.subTest(changes=changes):
                self.assertEqual(self.post(**changes).status_code, 422)
        response = self.client.post('/api/esp32/lecturas', json={
            'id_dispositivo': 1, 'simulado': False, 'rele_activado': False,
        }, headers={'X-API-Key': 'test-key'})
        self.assertEqual(response.status_code, 422)

    def test_automation_states_persist_and_validate(self):
        for state, active, water in [('regando', True, True), ('sin_agua', False, False),
                                     ('limite_riego', False, True)]:
            response = self.post(estado_riego=state, rele_activado=active, agua_detectada=water)
            self.assertEqual(response.status_code, 201, response.text)
            latest = self.client.get('/api/esp32/dispositivos/1/ultima').json()
            self.assertEqual(latest['estado_riego'], state)
            self.assertEqual(latest['rele_activado'], active)
            self.assertEqual(latest['agua_detectada'], water)
        self.assertEqual(self.post(estado_riego='desconocido').status_code, 422)


if __name__ == '__main__':
    unittest.main()
