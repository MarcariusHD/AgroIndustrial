"""Aplica la migración aditiva y verifica JSONB sin dejar muestras ficticias."""
import json
import sys
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import create_engine, text
from database import engine as configured_engine
from schemas.suelo import FormularioSuelo, allowed_units


def main():
    engine = create_engine(configured_engine.url, connect_args={'connect_timeout': 5})
    try:
        with engine.begin() as connection:
            connection.execute(text('SET LOCAL lock_timeout = \'5s\''))
            connection.execute(text('ALTER TABLE public.analisis_suelo ADD COLUMN IF NOT EXISTS formulario JSONB'))
        with engine.connect() as connection:
            column_type = connection.execute(text("SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='analisis_suelo' AND column_name='formulario'")).scalar_one()
            print(f'Migracion aplicada. Columna formulario: {column_type}.')
            greenhouse = connection.execute(text('SELECT id_invernadero FROM public.invernadero ORDER BY id_invernadero LIMIT 1')).scalar()
            if greenhouse is None:
                print('No hay invernaderos: estructura verificada; prueba de registro pendiente.')
                return
            # El identificador negativo evita consumir la secuencia de producción.
            test_id = -(uuid4().int % 2_000_000_000 + 1)
            payload = {'numero_muestra': 'PRUEBA-TEMPORAL', 'productor_finca': 'Finca de prueba', 'lote_sector': 'Sector 1',
                       'cultivo': 'Tomate', 'fecha_muestreo': '2026-10-06', 'geolocalizacion': '-16.5520, -68.1650',
                       'resultados': {'ph': {'valor': 6.5, 'unidad': 'Sin unidad', 'metodo': 'Agua 1:1'},
                                      'ec': {'valor': None, 'unidad': 'dS/m', 'metodo': ''}}}
            payload.update(ubicacion='Achocalla', superficie_ha=1.5, responsable_muestreo='María Pérez',
                           profundidad_desde=0, profundidad_hasta=20, tipo_muestra='Compuesta', numero_submuestras=15,
                           sistema_produccion='Riego', aplicaciones_recientes='Compost, 2 t/ha, 15/09/2026',
                           textura='Franca', determinacion_textura='Laboratorio', arena=40, limo=40, arcilla=20,
                           humedad_campo='Húmedo', drenaje='Moderado', compactacion='No', erosion='No evaluado',
                           observaciones_campo='Drenaje lento', laboratorio='Agro Suelos', numero_informe='LAB-018',
                           fecha_informe='2026-10-10', referencia_interpretacion='Informe LAB-018', interpretacion_ph='Adecuado',
                           nivel_mo='Adecuada', nivel_p='Bajo', nivel_k='Adecuado', otros_nutrientes='Magnesio bajo',
                           salinidad='No evaluada', sodicidad='No evaluada', limitantes_fisicas='Drenaje lento')
            for key in ['mo', 'n_total', 'n_nitrato', 'n_amonio', 'p', 'k', 'ca', 'mg', 'na', 'al', 'cic', 'cic_efectiva', 'sat_bases', 'sat_al', 'psi']:
                payload['resultados'][key] = {'valor': 1.5, 'unidad': sorted(allowed_units(key))[0], 'metodo': 'Método de prueba de persistencia'}
            payload = FormularioSuelo.model_validate(payload).model_dump(mode='json')
            try:
                connection.execute(text('INSERT INTO public.analisis_suelo (id_analisis, id_invernadero, formulario) VALUES (:id, :inv, CAST(:form AS jsonb))'), {'id': test_id, 'inv': greenhouse, 'form': json.dumps(payload)})
                saved = connection.execute(text('SELECT formulario FROM public.analisis_suelo WHERE id_analisis=:id'), {'id': test_id}).scalar_one()
                assert saved == payload, 'La lectura no coincide con los datos enviados.'
                print(f'Guardado y lectura PostgreSQL verificados: {len(payload) - 1} campos y {len(payload["resultados"])} parametros con valor, unidad y metodo.')
            finally:
                connection.rollback()
            exists = connection.execute(text('SELECT count(*) FROM public.analisis_suelo WHERE id_analisis=:id'), {'id': test_id}).scalar_one()
            assert exists == 0
            print('Prueba revertida. No se conservaron muestras ficticias ni se alteraron analisis existentes.')
    except Exception as exc:
        # No imprimir cadenas de conexión, credenciales ni registros del usuario.
        print(f'No se pudo completar la actualizacion/verificacion ({type(exc).__name__}). Comprueba PostgreSQL y la conexion configurada.')
        sys.exit(1)
    finally:
        engine.dispose()


if __name__ == '__main__':
    main()
