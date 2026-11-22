-- Ejecutar una vez sobre AGROINDUSTRIAL antes de reiniciar el backend.
-- Conserva las filas existentes y admite repetir la migración.
BEGIN;
ALTER TABLE lectura_esp32 ALTER COLUMN temperatura DROP NOT NULL;
ALTER TABLE lectura_esp32 ALTER COLUMN humedad DROP NOT NULL;
ALTER TABLE lectura_esp32 ALTER COLUMN luz_adc DROP NOT NULL;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS suelo_adc INTEGER;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS humedad_suelo DOUBLE PRECISION;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS suelo_seco BOOLEAN;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS agua_adc INTEGER;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS agua_detectada BOOLEAN;
ALTER TABLE lectura_esp32 ADD COLUMN IF NOT EXISTS rele_activado BOOLEAN;
COMMIT;
