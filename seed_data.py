import sys
import os
from sqlalchemy import text
from database import SessionLocal

def seed_sensors():
    db = SessionLocal()
    try:
        print("Iniciando carga de datos de prueba...")

        # 1. Asegurar que exista un invernadero y un dispositivo master
        db.execute(text("""
            INSERT INTO invernadero (id_invernadero, nombre, ubicacion, descripcion)
            VALUES (1, 'Invernadero Principal', 'Zona Norte', 'Producción Activa')
            ON CONFLICT (id_invernadero) DO NOTHING;
        """))

        db.execute(text("""
            INSERT INTO dispositivo (id_dispositivo, nombre, tipo, estado, id_invernadero)
            VALUES (1, 'ESP32-Master-01', 'Controlador', 'Activo', 1)
            ON CONFLICT (id_dispositivo) DO NOTHING;
        """))

        # 2. Definir los Tipos de Sensores
        tipos = [
            (1, 'Temp. Aire', '°C'),
            (2, 'Humedad', '%'),
            (3, 'VPD Suelo', 'kPa'),
            (4, 'Luz', 'lx'),
            (5, 'Consumo de Energía', 'kWh')
        ]
        for id_t, nombre, unidad in tipos:
            db.execute(text(f"""
                INSERT INTO tipo_sensor (id_tipo_sensor, nombre, unidad_medida)
                VALUES ({id_t}, '{nombre}', '{unidad}')
                ON CONFLICT (id_tipo_sensor) DO NOTHING;
            """))

        # 3. Vincular los Sensores al dispositivo
        for i in range(1, 6):
            db.execute(text(f"""
                INSERT INTO sensor (id_sensor, id_dispositivo, id_tipo_sensor)
                VALUES ({i}, 1, {i})
                ON CONFLICT (id_sensor) DO NOTHING;
            """))

        # 4. Insertar las Lecturas solicitadas
        # Usamos los IDs definidos arriba
        lecturas = [
            (1, 22.00),  # Temp. Aire
            (2, 65.00),  # Humedad
            (3, 1.20),   # VPD Suelo
            (4, 850.00), # Luz Solar
            (5, 45.80)   # Consumo de Energía
        ]
        
        for id_s, valor in lecturas:
            db.execute(text(f"INSERT INTO lectura (id_sensor, valor) VALUES ({id_s}, {valor})"))

        db.commit()
        print("\n✅ Datos insertados correctamente:")
        print("- Temp. Aire: 22°C")
        print("- Humedad: 65%")
        print("- VPD Suelo: 1.2 kPa")
        print("- Luz Solar: 850 W/m²")
        print("- Consumo Energía: 45.8 kWh")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sensors()