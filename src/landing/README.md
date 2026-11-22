# Organización de la portada

`../Landing.jsx` reúne navegación, perfil y configuración.

- `LandingContent.jsx`: selección de la vista actual.
- `LandingHome.jsx`: contenido de inicio y relatos.
- `LandingSeasons.jsx` y `SeasonCropDetailView.jsx`: temporadas y detalle de cultivo.
- `LandingCrops.jsx`: catálogo, manual y cultivos registrados.
- `LandingGreenhouse.jsx`: sectores del invernadero.
- `SectorTelemetryModal.jsx` y `getTelemetryData.js`: modal y generación existente de datos simulados.
- `useLandingState.jsx`: estado, efectos y operaciones de la página.
- `LandingProvider.jsx` y `LandingContext.js`: estado compartido entre las vistas de esta página.
- `homeData.jsx` y `manualPhasesData.js`: contenido de presentación.
- `plantUtils.js`: interpretación de descripciones e iconos de cultivos.

La separación conserva el comportamiento de la portada, incluida su simulación
de telemetría y el almacenamiento local existente.
