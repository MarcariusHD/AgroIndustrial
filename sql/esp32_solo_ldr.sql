-- Ejecutar en AGROINDUSTRIAL para admitir el LDR sin DHT22.
-- Conserva todas las lecturas existentes. Se puede ejecutar varias veces.
BEGIN;
ALTER TABLE lectura_esp32 ALTER COLUMN temperatura DROP NOT NULL;
ALTER TABLE lectura_esp32 ALTER COLUMN humedad DROP NOT NULL;
COMMIT;
