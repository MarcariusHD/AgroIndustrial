-- No se necesita ALTER TABLE: dispositivo.tipo admite el texto 'ESP32'.
-- Consulta los invernaderos antes de elegir el destino.
SELECT id_invernadero, nombre FROM invernadero ORDER BY id_invernadero;

-- Ejecuta este bloque después de reemplazar NULL por el ID elegido.
-- Ajusta también nombre y ubicación. El bloque evita duplicar el nombre
-- dentro del mismo invernadero si vuelves a ejecutarlo.
DO $$
DECLARE
    destino INTEGER := NULL; -- REEMPLAZAR por el ID del invernadero.
    nombre_esp32 TEXT := 'ESP32 Central';
    ubicacion_esp32 TEXT := 'Sector Norte';
BEGIN
    IF destino IS NULL OR NOT EXISTS (
        SELECT 1 FROM invernadero WHERE id_invernadero = destino
    ) THEN
        RAISE EXCEPTION 'Indica un ID de invernadero existente en la variable destino';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM dispositivo
        WHERE id_invernadero = destino
          AND lower(trim(nombre)) = lower(trim(nombre_esp32))
    ) THEN
        INSERT INTO dispositivo (nombre, tipo, estado, id_invernadero, ubicacion)
        VALUES (nombre_esp32, 'ESP32', 'Activo', destino, ubicacion_esp32);
    ELSE
        RAISE NOTICE 'Ya existe un componente con este nombre en ese invernadero';
    END IF;
END $$;
