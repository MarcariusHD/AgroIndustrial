# Formulario de análisis de suelos

El apartado “Análisis de Suelos y Nutrientes” usa cinco secciones: identificación y muestreo, condiciones físicas, laboratorio, intercambio y saturación, e interpretación agronómica.

Se retiraron CO₂, cultivo anterior/objetivo, recomendaciones y seguimiento, análisis complementarios y los campos finales “Principales limitantes identificadas”, “Observaciones” y “Responsable de la interpretación”. Se mantienen “Observaciones de campo” y “Limitantes físicas”.

## Actualizar una base existente

En pgAdmin, selecciona la base de la aplicación, abre Query Tool y ejecuta `sql/actualizar_analisis_suelo.sql`. Después reinicia el backend (`python -m uvicorn main:app --reload`, desde mi-app y con el entorno activado).

```sql
BEGIN;
ALTER TABLE public.analisis_suelo
    ADD COLUMN IF NOT EXISTS formulario JSONB;
COMMIT;
```

La migración se basa en `Static/IMG/base_prueba/basededatos13.sql`. Es aditiva y repetible. No hay que importar de nuevo el respaldo ni borrar la tabla. `create_all()` no actualiza tablas existentes: hay que ejecutar este SQL en cada base existente donde se despliegue el cambio.

## Dónde editar

- `src/soilForm.js`: etiquetas, campos, opciones, unidades predeterminadas y carga de registros anteriores.
- `src/SoilAnalysisModal.jsx`: diseño, estados de carga/edición y envío del formulario.
- `schemas/suelo.py`: tipos, límites y validaciones del nuevo formulario en el servidor.
- `main.py`: columna `AnalisisSuelo.formulario` y rutas GET/POST `/invernaderos/{id}/analisis-suelo`.
- `sql/actualizar_analisis_suelo.sql`: modificación de PostgreSQL.

Al añadir un campo, actualiza tanto `soilForm.js` como `schemas/suelo.py`. Los resultados guardan `valor`, `unidad` y `metodo`. El formulario completo se almacena en JSONB; el número de muestra también se guarda en la columna histórica `id_muestra`, sin cambiar la clave primaria `id_analisis`.

Los campos obligatorios son número de muestra, fecha de muestreo, lote y cultivo actual. Cada resultado informado exige su método. Las mediciones vacías se almacenan como null, no como cero. Las unidades se seleccionan de una lista compatible con el parámetro; cambiar la unidad no convierte el valor numérico. La interpretación se registra manualmente, sin clasificaciones automáticas.

## Ejemplos y validaciones en la página

`src/soilValidation.js` contiene ejemplos por campo, ejemplos de mediciones y métodos, unidades permitidas y mensajes en español. La pantalla muestra errores junto a los campos después de salir del control o intentar guardar, marca los campos en rojo y enfoca el primer error. No usa las ventanas de validación nativas del navegador. Los números rechazan letras, signos negativos y exponentes; aceptan coma decimal y la normalizan a punto. Los textos conservan nombres con tildes y se limitan en longitud. No se admiten etiquetas HTML.

Se comprueban rangos de coordenadas, pH 0–14, porcentajes 0–100, submuestras enteras, intervalo de profundidad, fecha del informe posterior o igual al muestreo y suma de arena/limo/arcilla igual a 100 % con tolerancia de 0,5. `schemas/suelo.py` repite las comprobaciones en el servidor. Una validación de formato no confirma la veracidad del análisis: los ejemplos no se rellenan automáticamente.

Los datos completos se guardan en `public.analisis_suelo.formulario` (JSONB), incluidos valores, unidades y métodos. El servidor confirma el guardado después del commit y devuelve el formulario leído de la base. Para inspeccionarlo en pgAdmin:

```sql
SELECT id_analisis, id_invernadero, jsonb_pretty(formulario::jsonb)
FROM public.analisis_suelo
WHERE formulario IS NOT NULL;
```

`scripts/update_soil_database.py` aplica la migración y verifica la persistencia con una transacción que se revierte. No deja registros ficticios ni consume la secuencia de muestras. La migración fue aplicada y comprobada en la base local durante esta actualización.

Los registros anteriores se pueden abrir y editar. Se conservan las columnas históricas; `formulario` es la fuente vigente una vez guardado. Los nutrientes de columnas antiguas no se sobrescriben ni convierten automáticamente. Cualquier informe futuro debe leer `formulario.resultados` cuando esté disponible. El nitrógeno antiguo en ppm no se copia a N total (%) porque su forma no está identificada; debe transcribirse desde el informe. Los intervalos antiguos de profundidad reconocibles (por ejemplo 0-20 cm) se recuperan; otros formatos requieren revisión.

## Verificación

```powershell
npm run build
node --test src/soilForm.test.js src/soilValidation.test.js
..\env\Scripts\python.exe -m unittest discover -s tests -p test_soil_form.py
```

Las pruebas del servidor usan SQLite en memoria y no alteran la base de la aplicación.
