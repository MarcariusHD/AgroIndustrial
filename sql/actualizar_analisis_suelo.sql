-- Ejecutar en la base PostgreSQL de la aplicación antes de iniciar el backend.
-- Compatible con Static/IMG/base_prueba/basededatos13.sql.
-- No elimina ni modifica los valores históricos. Puede ejecutarse nuevamente.
BEGIN;
ALTER TABLE public.analisis_suelo
    ADD COLUMN IF NOT EXISTS formulario JSONB;
COMMENT ON COLUMN public.analisis_suelo.formulario IS
    'Formulario agrícola vigente: identificación, propiedades físicas, resultados con unidad y método, intercambio e interpretación. NULL en registros anteriores.';
COMMIT;
