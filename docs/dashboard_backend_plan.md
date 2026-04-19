# Propuesta de cambios en la lógica backend para el dashboard

## Diagnóstico rápido del estado actual

1. El frontend del dashboard consume datos principalmente mockeados (dispositivos, métricas, estados) y solo llama al backend para usuarios (`/usuario`) y autenticación (`/login`, `/registro`).
2. El backend está dividido en dos entradas (`main.py` y `Backend/main.py`) con diferencias importantes, lo que puede provocar despliegues inconsistentes.
3. No hay endpoints de dominio para dashboard (KPIs, series temporales, alertas, estado de dispositivos).
4. El rol de administrador se determina por correo hardcodeado o por substring (`"admin" in user.correo`), lo cual no es escalable ni seguro.
5. No existe token de sesión (JWT) ni control de autorización por endpoint.

## Cambios que haría en la lógica de backend del dashboard

### 1) Unificar arquitectura del backend

- Mantener **una sola app FastAPI** (preferiblemente `Backend/main.py` o `main.py`, pero no ambas activas).
- Estandarizar capas:
  - `routers/` para endpoints
  - `services/` o `controllers/` para lógica
  - `repositories/` para acceso a datos complejos
  - `schemas/` para contratos de API

**Impacto:** reduce errores por rutas duplicadas y simplifica mantenimiento.

### 2) Crear un módulo de dominio para dashboard

Agregar router `dashboard_router.py` con endpoints como:

- `GET /dashboard/summary`
  - total_dispositivos
  - dispositivos_online/offline
  - alertas_activas
  - consumo_energia_hoy
  - rendimiento_promedio
- `GET /dashboard/series?metric=temperatura&from=...&to=...&interval=hour`
- `GET /dashboard/devices/status`
- `GET /dashboard/alerts?status=active&severity=high`

**Impacto:** el dashboard deja de depender de mocks y pasa a datos reales versionados.

### 3) Modelo de datos para telemetría y alertas

Agregar tablas (SQLAlchemy):

- `device` (id, nombre, tipo, invernadero, estado, last_seen_at)
- `telemetry` (id, device_id, metric, value, unit, recorded_at)
- `alert` (id, device_id, severity, message, status, created_at, resolved_at)
- `kpi_daily` (date, energia_kwh, productividad, uptime_pct, alertas)

**Impacto:** permite consultas rápidas para gráficas, tarjetas KPI y trazabilidad histórica.

### 4) Seguridad real para autenticación/autorización

- Implementar `POST /auth/login` con JWT (access token + expiración).
- Guardar roles en DB (`role`, `user_role`) y eliminar hardcode de admin.
- Proteger endpoints de dashboard:
  - `admin`: gestión de usuarios/componentes
  - `operator`: lectura de métricas/alertas

**Impacto:** el acceso al dashboard se vuelve auditable y preparado para producción.

### 5) Contratos de API orientados a frontend

Definir esquemas de respuesta estables:

- Estructura común de errores (`code`, `message`, `fields`).
- DTOs para gráficas (`labels`, `series`, `unit`, `range`).
- Versionado inicial `v1` (`/api/v1/...`).

**Impacto:** menos lógica condicional en React y menos acoplamiento.

### 6) Optimización de consultas y performance

- Índices por `telemetry(recorded_at, device_id, metric)` y `alert(status, severity, created_at)`.
- Agregaciones precomputadas por hora/día (job de consolidación).
- Paginación y filtros en endpoints de listas.
- Cache corta (30–120s) para summary del dashboard.

**Impacto:** mejora tiempos de respuesta del dashboard bajo carga.

### 7) Observabilidad y salud operativa

- `GET /health/live` y `GET /health/ready`.
- Logging estructurado por request (`request_id`, `user_id`, latencia).
- Métricas Prometheus básicas (RPS, latencia, errores 4xx/5xx).

**Impacto:** facilita detectar y corregir caídas o degradaciones.

### 8) Plan de migración incremental (sin romper frontend)

1. Mantener endpoints actuales (`/usuario`, `/registro`, `/login`) temporalmente.
2. Introducir `/api/v1/dashboard/*`.
3. Conectar frontend gradualmente por módulo (tarjetas, gráficas, alertas).
4. Eliminar mocks cuando la cobertura backend llegue al 100% del dashboard.

## Prioridad sugerida (quick wins primero)

1. Seguridad (JWT + roles en DB).
2. Endpoints `summary` y `devices/status`.
3. Serie temporal de 2 métricas críticas (temperatura y consumo).
4. Alertas activas y recientes.
5. Optimización (índices, cache y agregación diaria).

## Riesgos actuales que resolvería con estos cambios

- Inconsistencia por doble `main.py`.
- Escalamiento limitado por rol hardcodeado.
- Datos no confiables por dependencia de mocks en dashboard.
- Falta de trazabilidad histórica para análisis agronómico.
- Dificultad de operación por falta de observabilidad.
