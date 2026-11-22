import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app, get_db, AnalisisSuelo, Invernadero


class SoilFormTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Invernadero.__table__.create(self.engine)
        AnalisisSuelo.__table__.create(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            db.add(Invernadero(id_invernadero=1, nombre='Prueba', ubicacion='Prueba'))
            db.commit()
        def override_db():
            with self.sessions() as db:
                yield db
        app.dependency_overrides[get_db] = override_db
        # No lifespan: las pruebas nunca conectan a la base configurada del usuario.
        self.client = TestClient(app)
        self.url = '/invernaderos/1/analisis-suelo'
        self.form = dict(numero_muestra='001', lote_sector='Norte', cultivo='Tomate', fecha_muestreo='2026-10-06',
                         observaciones_campo='Drenaje lento', profundidad_desde=0, profundidad_hasta=20,
                         resultados={'ph': {'valor': 0, 'unidad': 'Sin unidad', 'metodo': 'Agua 1:1'},
                                     'ec': {'valor': None, 'unidad': 'dS/m', 'metodo': ''}})

    def tearDown(self):
        self.client.close()
        app.dependency_overrides.clear()
        self.engine.dispose()

    def test_create_read_update_zero_and_null(self):
        self.assertIsNone(self.client.get(self.url).json())
        self.assertEqual(self.client.post(self.url, json={'formulario': self.form}).status_code, 200)
        data = self.client.get(self.url).json()
        self.assertEqual(data['id_muestra'], '001')
        self.assertEqual(data['formulario']['resultados']['ph']['valor'], 0)
        self.assertIsNone(data['formulario']['resultados']['ec']['valor'])
        self.assertEqual(data['formulario']['observaciones_campo'], 'Drenaje lento')
        self.form['resultados']['ph']['valor'] = 6.5
        self.assertEqual(self.client.post(self.url, json={'formulario': self.form}).status_code, 200)
        self.assertEqual(self.client.get(self.url).json()['formulario']['resultados']['ph']['valor'], 6.5)
        with self.sessions() as db:
            self.assertEqual(db.query(AnalisisSuelo).count(), 1)

    def test_invalid_values_rejected(self):
        for change in ({'profundidad_hasta': -1}, {'profundidad_desde': 30}, {'numero_muestra': ' '},
                       {'arena': 101}, {'numero_submuestras': 1.5}, {'fecha_muestreo': 'invalid'},
                       {'resultados': {'ph': {'valor': 15, 'unidad': 'Sin unidad'}}},
                       {'resultados': {'ec': {'valor': -1, 'unidad': 'dS/m'}}},
                       {'resultados': {'mo': {'valor': 101, 'unidad': '%'}}}):
            with self.subTest(change=change):
                self.assertEqual(self.client.post(self.url, json={'formulario': self.form | change}).status_code, 422)

    def test_legacy_values_preserved(self):
        with self.sessions() as db:
            db.add(AnalisisSuelo(id_invernadero=1, id_muestra='old', n='42', recomendacion='Histórico'))
            db.commit()
        self.assertEqual(self.client.post(self.url, json={'formulario': self.form}).status_code, 200)
        data = self.client.get(self.url).json()
        self.assertEqual(data['n'], '42')
        self.assertEqual(data['recomendacion'], 'Histórico')
        self.assertEqual(self.client.post(self.url, json={'ph': '5'}).status_code, 409)

    def test_missing_greenhouse(self):
        self.assertEqual(self.client.post('/invernaderos/999/analisis-suelo', json={'formulario': self.form}).status_code, 404)

    def test_format_and_cross_field_validation(self):
        for change in ({'geolocalizacion': '100, 200'}, {'numero_muestra': '<M-001>'}, {'cultivo': '12345'},
                       {'laboratorio': '<script>alert(1)</script>'}, {'fecha_informe': '2026-10-01'},
                       {'arena': 60, 'limo': 40, 'arcilla': 20}, {'tipo_muestra': 'Cualquiera'},
                       {'resultados': {'ph': {'valor': 6.5, 'unidad': 'ppm', 'metodo': 'Agua'}}},
                       {'resultados': {'ph': {'valor': 6.5, 'unidad': 'Sin unidad', 'metodo': ''}}}):
            with self.subTest(change=change):
                self.assertEqual(self.client.post(self.url, json={'formulario': self.form | change}).status_code, 422)

    def test_complete_form_persists_every_field(self):
        complete = self.form | dict(productor_finca='Finca Los Pinos', ubicacion='Achocalla', geolocalizacion='-16.5520, -68.1650',
            superficie_ha=1.5, responsable_muestreo='María Pérez', tipo_muestra='Compuesta', numero_submuestras=15,
            sistema_produccion='Riego', aplicaciones_recientes='Compost, 2 t/ha, 15/09/2026', textura='Franca',
            determinacion_textura='Laboratorio', arena=40, limo=40, arcilla=20, humedad_campo='Húmedo', drenaje='Moderado',
            compactacion='No', erosion='No evaluado', laboratorio='Agro Suelos', numero_informe='LAB-018', fecha_informe='2026-10-10',
            referencia_interpretacion='Informe LAB-018', interpretacion_ph='Adecuado', nivel_mo='Adecuada', nivel_p='Bajo', nivel_k='Adecuado',
            otros_nutrientes='Magnesio bajo', salinidad='No evaluada', sodicidad='No evaluada', limitantes_fisicas='Drenaje lento')
        response = self.client.post(self.url, json={'formulario': complete})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()['formulario'], complete)
        self.assertEqual(self.client.get(self.url).json()['formulario'], complete)


if __name__ == '__main__':
    unittest.main()
