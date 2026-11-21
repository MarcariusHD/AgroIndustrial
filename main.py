import os
import shutil
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text, Column, Integer, String, Text as SQLText, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from Controllers.usuario_controller import registrar_usuario_logic, obtener_usuario_logic
from models.usuario import Usuario
from models.rol import Rol
from models.usuario_rol import UsuarioRol
from schemas.usuario import UsuarioCreate, UsuarioOut
from schemas.suelo import FormularioSuelo
from pydantic import BaseModel, EmailStr
import bcrypt
from typing import List, Optional
from esp32_api import create_router as create_esp32_router, ensure_fan_columns
from energy_api import create_energy_router
from electronic_metrics import ElectronicConfig, create_electronic_router

class Invernadero(Base):
    __tablename__ = "invernadero"
    id_invernadero = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    ubicacion = Column(String(50), nullable=False)
    descripcion = Column(SQLText)
    id_usuario = Column(Integer, index=True, nullable=True) # Opcional por ahora


class Dispositivo(Base):
    __tablename__ = "dispositivo"
    id_dispositivo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    estado = Column(String(20), default="Activo")
    ubicacion = Column(String(100), nullable=True)
    id_invernadero = Column(Integer, index=True, nullable=True)
    config_electronica = Column(JSON, nullable=True)


class Relato(Base):
    __tablename__ = "relato"
    id_relato = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    mensaje = Column(SQLText, nullable=False)
    foto = Column(SQLText)  # Almacenaremos la imagen como base64 o URL
    id_usuario = Column(Integer, index=True)


class AnalisisSuelo(Base):
    __tablename__ = "analisis_suelo"
    id_analisis = Column(Integer, primary_key=True, index=True)
    id_invernadero = Column(Integer, index=True, nullable=False)
    id_muestra = Column(String(50))
    fecha_muestreo = Column(String(50))
    lote_sector = Column(String(100))
    geolocalizacion = Column(String(100))
    cultivo = Column(String(100))
    profundidad = Column(String(50))
    ph = Column(String(20))
    ec = Column(String(20))
    co2 = Column(String(20))
    mo = Column("materia_organica", String(20))
    n = Column("nitrogeno_total", String(20))
    p = Column("fosforo_disponible", String(20))
    k = Column("potasio_intercambiable", String(20))
    ca = Column("calcio", String(20))
    mg = Column("magnesio", String(20))
    na = Column("sodio", String(20))
    cic = Column(String(20))
    sat_bases = Column("saturacion_bases", String(20))
    sat_al = Column("saturacion_aluminio", String(20))
    textura = Column(String(50))
    densidad = Column("densidad_aparente", String(50))
    humedad = Column("humedad_actual", String(50))
    estado_balance = Column(String(50), default="Óptimo")
    recomendacion = Column("recomendacion_enmienda", SQLText)
    formulario = Column(JSON, nullable=True)


class Telemetria(Base):
    __tablename__ = "telemetria"
    id_telemetria = Column(Integer, primary_key=True, index=True)
    id_dispositivo = Column(Integer, ForeignKey("dispositivo.id_dispositivo"), index=True)
    metrica = Column(String(50), nullable=False) # ej: temperatura, humedad
    valor = Column(Float, nullable=False)
    unidad = Column(String(20)) # ej: °C, %
    fecha_registro = Column(DateTime, default=datetime.utcnow)


class Alerta(Base):
    __tablename__ = "alerta"
    id_alerta = Column(Integer, primary_key=True, index=True)
    id_dispositivo = Column(Integer, ForeignKey("dispositivo.id_dispositivo"), index=True)
    severidad = Column(String(20)) # high, medium, low
    mensaje = Column(SQLText)
    estado = Column(String(20), default="Activa") # Activa, Resuelta
    creado_en = Column(DateTime, default=datetime.utcnow)
    resuelto_en = Column(DateTime, nullable=True)


class KpiDiario(Base):
    __tablename__ = "kpi_diario"
    id_kpi = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    id_invernadero = Column(Integer, ForeignKey("invernadero.id_invernadero"), index=True)
    energia_kwh = Column(Float, default=0.0)
    productividad = Column(Float, default=0.0)
    uptime_pct = Column(Float, default=0.0)
    alertas_conteo = Column(Integer, default=0)


app = FastAPI()

# Configuración de CORS: Permite que tu React (puerto 5173) hable con FastAPI (puerto 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def configure_db():
    Base.metadata.create_all(bind=engine)
    ensure_fan_columns(engine)

base_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(base_dir, "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/api/asset/{category}/{filename}")
def get_asset(category: str, filename: str):
    """
    Busca y sirve un archivo estático basándose solo en el nombre, 
    sin necesidad de conocer la extensión (jpg, png, jpeg, etc.)
    """
    # Normalizamos el nombre de la categoría para evitar errores de mayúsculas
    category_folder = category
    if os.path.exists(static_path):
        for d in os.listdir(static_path):
            if d.lower() == category.lower():
                category_folder = d
                break

    dir_path = os.path.join(static_path, category_folder)
    if not os.path.isdir(dir_path):
        raise HTTPException(status_code=404, detail="Categoría de recursos no encontrada")
    
    # Buscamos de manera recursiva
    filename_clean = os.path.splitext(filename)[0].lower()
    
    # 1. Búsqueda exacta de archivo
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            name_in_disk = os.path.splitext(file)[0].lower()
            if name_in_disk == filename_clean:
                return FileResponse(os.path.join(root, file))
                
    # 2. Búsqueda por nombre de carpeta
    for root, dirs, files in os.walk(dir_path):
        folder_name = os.path.basename(root).lower()
        # Normalizamos un poco para plurales/singulares
        if folder_name == filename_clean or folder_name.replace('s', '') == filename_clean.replace('s', ''):
            valid_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))]
            if valid_files:
                return FileResponse(os.path.join(root, valid_files[0]))

    # 3. Búsqueda parcial de archivo (ej: fresas1.jpg coincide con fresas)
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            name_in_disk = os.path.splitext(file)[0].lower()
            if name_in_disk.startswith(filename_clean) or filename_clean.startswith(name_in_disk):
                return FileResponse(os.path.join(root, file))
                
    raise HTTPException(status_code=404, detail=f"Imagen '{filename}' no encontrada en {category_folder}")


@app.post("/api/invernaderos/{id_inv}/foto")
async def subir_foto_invernadero(id_inv: str, file: UploadFile = File(...)):
    """
    Guarda la foto de un invernadero en la carpeta static/IMG.
    Si ya existe una imagen para ese ID (incluso con otra extensión), la reemplaza.
    """
    img_dir = os.path.join(static_path, "IMG")
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    # Normalizamos el nombre base (ej: invernadero_1 o invernadero_default)
    filename_base = f"invernadero_{id_inv}"
    
    # Limpiamos archivos existentes con el mismo nombre base pero distinta extensión
    for existing_file in os.listdir(img_dir):
        if os.path.splitext(existing_file)[0].lower() == filename_base.lower():
            os.remove(os.path.join(img_dir, existing_file))

    # Guardamos el nuevo archivo manteniendo su extensión original
    extension = os.path.splitext(file.filename)[1]
    final_path = os.path.join(img_dir, f"{filename_base}{extension}")

    with open(final_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "Imagen guardada correctamente", "filename": f"{filename_base}{extension}"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.include_router(create_esp32_router(get_db, Dispositivo))
app.include_router(create_energy_router(get_db))
app.include_router(create_electronic_router(get_db, Dispositivo))

@app.get("/")
def read_root():
    return {"message": "API de AgroIndustrial funcionando. Ve a /docs para ver las rutas disponibles."}


@app.post("/registro")
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Llama a la lógica definida en tu controlador
    return registrar_usuario_logic(db, usuario)


class UsuarioLogin(BaseModel):
    correo: EmailStr
    password: str


@app.post("/login")
def login_usuario(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    print(f"\n--- Intento de Inicio de Sesión ---")
    
    # Limpieza de espacios en blanco accidentales (importante para evitar errores invisibles)
    correo_ingresado = credenciales.correo.strip()
    password_ingresada = credenciales.password.strip()
    
    print(f"Correo ingresado: '{correo_ingresado}'")
    
    # Buscamos al usuario ignorando mayúsculas/minúsculas
    user = db.query(Usuario).filter(Usuario.correo.ilike(correo_ingresado)).first()
    
    if not user:
        print(f"Resultado: El usuario '{correo_ingresado}' NO existe en la base de datos.")
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    try:
        # Verificación directa con bcrypt (comparamos bytes)
        # Usamos .strip() en el hash de la DB para eliminar espacios accidentales (padding)
        hashed_password = user.password.strip().encode('utf-8')
        plain_password = password_ingresada.encode('utf-8')
        is_valid = bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Error técnico en bcrypt: {e}")
        is_valid = False

    if not is_valid:
        print(f"Resultado: Contraseña incorrecta para el usuario '{user.correo}'")
        print(f"DEBUG: Longitud en DB: {len(user.password.strip())}, Longitud ingresada: {len(password_ingresada)}")
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    
    try:
        # Buscamos el nombre del rol uniendo las tablas correspondientes
        role_data = (
            db.query(Rol.nombre_rol)
            .join(UsuarioRol, UsuarioRol.id_rol == Rol.id_rol)
            .filter(UsuarioRol.id_usuario == user.id_usuario)
            .first()
        )
        rol_usuario = str(role_data[0]).strip().lower() if role_data else "user"
    except Exception as e:
        print(f"Error al obtener rol: {e}")
        rol_usuario = "user"
    
    print(f"Resultado: ¡Login exitoso para {user.correo}! Rol detectado: {rol_usuario}")
    return {
        "message": "Inicio de sesión exitoso", 
        "usuario": user.correo, 
        "rol": rol_usuario, 
        "id_usuario": user.id_usuario,
        "nombres": user.nombres,
        "apellidos": user.apellidos
    }


@app.get("/usuario")
def obtener_usuario(db: Session = Depends(get_db)):
    """Obtiene la lista de usuarios con sus respectivos roles para la gestión de accesos."""
    # Verificación rápida: Asegurar que existan roles si la base está limpia
    roles_existentes = {r.nombre_rol for r in db.query(Rol).all()}
    roles_necesarios = ["admin", "user", "supervisor"]
    for r_name in roles_necesarios:
        if r_name not in roles_existentes:
            db.add(Rol(nombre_rol=r_name))
    if any(r_name not in roles_existentes for r_name in roles_necesarios):
        db.commit()

    # Consulta con JOIN para obtener el rol actual de cada usuario
    results = db.query(
        Usuario, 
        Rol.id_rol, 
        Rol.nombre_rol
    ).outerjoin(UsuarioRol, Usuario.id_usuario == UsuarioRol.id_usuario)\
     .outerjoin(Rol, UsuarioRol.id_rol == Rol.id_rol).all()
    
    usuarios_con_rol = []
    for user, id_rol, nombre_rol in results:
        usuarios_con_rol.append({
            "id_usuario": user.id_usuario,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "correo": user.correo,
            "celular": user.celular,
            "id_rol": id_rol,
            "nombre_rol": nombre_rol or "Sin Rol"
        })
    return usuarios_con_rol


class UsuarioUpdate(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    celular: str
    password: str = None # Opcional en edición
    id_rol: int = None   # Opcional en edición básica


@app.put("/usuarios/{id_usuario}")
def actualizar_usuario(id_usuario: int, usuario_data: UsuarioUpdate, db: Session = Depends(get_db)):
    """Actualiza los datos de un usuario y gestiona su rol en la misma operación."""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db_user.nombres = usuario_data.nombres
    db_user.apellidos = usuario_data.apellidos
    db_user.correo = usuario_data.correo
    db_user.celular = usuario_data.celular
    
    if usuario_data.password:
        salt = bcrypt.gensalt()
        db_user.password = bcrypt.hashpw(usuario_data.password.encode('utf-8'), salt).decode('utf-8')
    
    # Sincronización de Rol: Permite cambiar entre Admin y User
    if usuario_data.id_rol is not None:
        rol_existe = db.query(Rol).filter(Rol.id_rol == usuario_data.id_rol).first()
        if not rol_existe:
            raise HTTPException(status_code=400, detail="El rol especificado no existe")
            
        vinculo = db.query(UsuarioRol).filter(UsuarioRol.id_usuario == id_usuario).first()
        if vinculo:
            vinculo.id_rol = usuario_data.id_rol
        else:
            nuevo_vinculo = UsuarioRol(id_usuario=id_usuario, id_rol=usuario_data.id_rol)
            db.add(nuevo_vinculo)

    db.commit()
    return {"message": "Usuario y rol actualizados correctamente"}


@app.delete("/usuarios/{id_usuario}")
def eliminar_usuario(id_usuario: int, db: Session = Depends(get_db)):
    """Elimina un usuario y sus vínculos de rol."""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    try:
        # Desvincular de invernaderos (poner en NULL) para no romper la integridad
        db.query(Invernadero).filter(Invernadero.id_usuario == id_usuario).update({Invernadero.id_usuario: None})
        # Eliminamos primero la relación en la tabla intermedia usuario_rol
        db.query(UsuarioRol).filter(UsuarioRol.id_usuario == id_usuario).delete()
        db.delete(db_user)
        db.commit()
        return {"message": "Usuario eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")


class RoleUpdate(BaseModel):
    id_rol: int


@app.get("/roles")
def listar_roles(db: Session = Depends(get_db)):
    """Lista todos los roles disponibles (Admin, Operador, etc)."""
    return db.query(Rol).all()


@app.put("/usuarios/{id_usuario}/rol")
def actualizar_rol_usuario(id_usuario: int, data: RoleUpdate, db: Session = Depends(get_db)):
    """Cambia el rol asignado a un usuario."""
    # Verificar que el rol existe
    rol_existe = db.query(Rol).filter(Rol.id_rol == data.id_rol).first()
    if not rol_existe:
        raise HTTPException(status_code=400, detail="El rol especificado no existe")

    # Buscar vínculo actual o crear uno nuevo
    vinculo = db.query(UsuarioRol).filter(UsuarioRol.id_usuario == id_usuario).first()
    if vinculo:
        vinculo.id_rol = data.id_rol
    else:
        nuevo_vinculo = UsuarioRol(id_usuario=id_usuario, id_rol=data.id_rol)
        db.add(nuevo_vinculo)
    
    db.commit()
    return {"message": f"Rol actualizado a {rol_existe.nombre_rol}"}


@app.get("/api/v1/dashboard/summary")
def obtener_resumen_dashboard(id_inv: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Endpoint de dominio unificado para el Dashboard (KPIs principales).
    Implementa el punto 2 de la propuesta de backend.
    """
    try:
        # Conteo de dispositivos
        query_disp = db.query(Dispositivo)
        if id_inv:
            query_disp = query_disp.filter(Dispositivo.id_invernadero == id_inv)
        
        total_dispositivos = query_disp.count()
        dispositivos_online = query_disp.filter(Dispositivo.estado == "Activo").count()
        
        # Alertas activas
        query_alerts = db.query(Alerta).filter(Alerta.estado == "Activa")
        if id_inv:
            query_alerts = query_alerts.join(Dispositivo).filter(Dispositivo.id_invernadero == id_inv)
        
        alertas_activas = query_alerts.count()

        # Retornamos contrato de API orientado a frontend (Punto 5 del plan)
        return {
            "total_dispositivos": total_dispositivos,
            "dispositivos_online": dispositivos_online,
            "dispositivos_offline": total_dispositivos - dispositivos_online,
            "alertas_activas": alertas_activas,
            "rendimiento_promedio": 88.2, # Mock hasta Job de consolidación
            "consumo_energia_hoy": 14.5   # Mock hasta Telemetry Job
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/dashboard/mediciones", response_model=List[dict])
def obtener_mediciones_dashboard(id_inv: int = None, db: Session = Depends(get_db)):
    """
    Obtiene la última lectura de cada sensor configurado en el sistema.
    Si se proporciona id_inv, filtra solo los sensores de ese invernadero.
    """
    # Si id_inv llega como 0, lo tratamos como None para mostrar todos
    if id_inv == 0:
        id_inv = None

    sql = """
        SELECT ts.nombre, l.valor, ts.unidad_medida
        FROM lectura l
        JOIN sensor s ON l.id_sensor = s.id_sensor
        JOIN tipo_sensor ts ON s.id_tipo_sensor = ts.id_tipo_sensor
        JOIN dispositivo d ON s.id_dispositivo = d.id_dispositivo
        WHERE l.id_lectura IN (
            SELECT MAX(id_lectura)
            FROM lectura
            GROUP BY id_sensor
        )
    """
    
    # Agregamos filtro dinámico robusto para evitar errores de sintaxis
    sql += " AND (:id_inv IS NULL OR d.id_invernadero = :id_inv)"

    try:
        result = db.execute(text(sql), {"id_inv": id_inv}).fetchall()
        # Formateamos para que el frontend reciba una lista de objetos fácil de mapear
        payload = []
        for row in result:
            payload.append({"nombre": row[0], "valor": float(row[1]), "unidad": row[2]})
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar mediciones: {str(e)}")


@app.get("/dashboard/dispositivos", response_model=List[dict])
def obtener_dispositivos_dashboard(id_inv: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Obtiene la lista de dispositivos y su estado actual.
    Permite filtrar por invernadero para la sección 'Dispositivos Activos'.
    """
    if id_inv == 0:
        id_inv = None

    sql = """
        SELECT d.id_dispositivo, d.nombre, d.tipo, d.estado, d.ubicacion, i.nombre as invernadero, d.id_invernadero, d.config_electronica
        FROM dispositivo d
        LEFT JOIN invernadero i ON d.id_invernadero = i.id_invernadero
        WHERE (:id_inv IS NULL OR d.id_invernadero = :id_inv)
    """
    
    try:
        result = db.execute(text(sql), {"id_inv": id_inv}).fetchall()
        return [{"id": r[0], "nombre": r[1], "tipo": r[2], "estado": r[3], "location": r[4] or "Central", "invernadero": r[5] or "Sin Nombre", "id_inv": r[6], "config_electronica": r[7]} for r in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener dispositivos: {str(e)}")


@app.get("/dashboard/alertas", response_model=List[dict])
def obtener_alertas_dashboard(id_inv: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Genera alertas basadas en el estado de los componentes electrónicos.
    Los dispositivos inactivos o en mantenimiento aparecen como alertas críticas.
    """
    # Si id_inv llega como 0 (a veces pasa desde el frontend), lo tratamos como None para mostrar todos
    if id_inv == 0:
        id_inv = None

    try:
        # Usamos :id_inv como placeholder (Sintaxis SQLAlchemy para Postgres)
        # La lógica (:id_inv IS NULL OR ...) permite que si no hay ID, devuelva todo.
        sql = """
            SELECT d.id_dispositivo, d.nombre, d.tipo, d.estado, d.ubicacion, i.nombre as invernadero, d.id_invernadero
            FROM dispositivo d
            LEFT JOIN invernadero i ON d.id_invernadero = i.id_invernadero
            WHERE (:id_inv IS NULL OR d.id_invernadero = :id_inv)
        """
        
        result = db.execute(text(sql), {"id_inv": id_inv}).fetchall()
        alerts = []
        for r in result:
            # Mapeo de iconos por tipo de componente
            icons = {
                'Bomba de Agua': '💧', 'Luz LED': '💡', 'Sensor de Temperatura': '🌡️', 
                'Ventilador': '🌬️', 'Sensor de Luz': '☀️', 'Sensor de Humedad': '🌱',
                'Sensor de pH': '🧪', 'Sensor de CO2': '☁️',
                'Cámara': '📷', 'ESP32': '🔌'
            }
            
            is_active = r[3] == 'Activo'
            alerts.append({
                "id": f"DEV-{r[0]}",
                "name": r[1],
                "val": "OPERATIVO" if is_active else "SIN SEÑAL",
                "dev": "ESTABLE" if is_active else "CRÍTICO",
                "status": "safe" if is_active else "danger",
                "location": r[4],
                "invernadero": r[5],
                "place": f"{r[4] if r[4] else 'Central'} - {r[5] if r[5] else 'Invernadero'}",
                "icon": icons.get(r[2], '📡'),
                "id_inv": r[6]
            })
        return alerts
    except Exception as e:
        print(f"Error detallado en alertas: {str(e)}")
        return []


@app.get("/healthcheck")
def verificar_base_de_datos(db: Session = Depends(get_db)):
    try:
        # Ejecuta una consulta simple de SQL
        db.execute(text("SELECT 1"))
        return {"status": "conectado", "database": "PostgreSQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")


class InvernaderoCreate(BaseModel):
    nombre: str
    ubicacion: str
    descripcion: str
    id_usuario: int


@app.get("/invernaderos")
def listar_invernaderos(db: Session = Depends(get_db)):
    """Obtiene la lista de invernaderos desde la base de datos."""
    try:
        return db.query(Invernadero).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener invernaderos: {str(e)}")


@app.post("/invernaderos")
def crear_invernadero(invernadero: InvernaderoCreate, db: Session = Depends(get_db)):
    """Crea un nuevo registro de invernadero."""
    try:
        # Verificar duplicados por nombre
        nombre_limpio = invernadero.nombre.strip()
        existe = db.query(Invernadero).filter(Invernadero.nombre.ilike(nombre_limpio)).first()
        if existe:
            raise HTTPException(status_code=400, detail=f"El invernadero '{nombre_limpio}' ya existe.")

        nuevo_inv = Invernadero(
            nombre=invernadero.nombre,
            ubicacion=invernadero.ubicacion,
            descripcion=invernadero.descripcion,
            id_usuario=invernadero.id_usuario
        )
        db.add(nuevo_inv)
        db.commit()
        db.refresh(nuevo_inv)
        return {"message": "Invernadero creado exitosamente", "id": nuevo_inv.id_invernadero}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear invernadero: {str(e)}")


@app.put("/invernaderos/{id_inv}")
def actualizar_invernadero(id_inv: int, invernadero: InvernaderoCreate, db: Session = Depends(get_db)):
    """Actualiza los datos de un invernadero existente."""
    try:
        db_inv = db.query(Invernadero).filter(Invernadero.id_invernadero == id_inv).first()
        if not db_inv:
            raise HTTPException(status_code=404, detail="Invernadero no encontrado")
        
        # Verificar duplicados excluyendo el actual
        nombre_limpio = invernadero.nombre.strip()
        existe = db.query(Invernadero).filter(
            Invernadero.nombre.ilike(nombre_limpio),
            Invernadero.id_invernadero != id_inv
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail=f"Ya existe otro invernadero con el nombre '{nombre_limpio}'.")

        db_inv.nombre = invernadero.nombre
        db_inv.ubicacion = invernadero.ubicacion
        db_inv.descripcion = invernadero.descripcion
        
        db.commit()
        return {"message": "Invernadero actualizado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {str(e)}")


@app.delete("/invernaderos/{id_inv}")
def eliminar_invernadero(id_inv: int, db: Session = Depends(get_db)):
    """Elimina un invernadero de la base de datos."""
    try:
        db_inv = db.query(Invernadero).filter(Invernadero.id_invernadero == id_inv).first()
        if not db_inv:
            raise HTTPException(status_code=404, detail="Invernadero no encontrado")
        db.delete(db_inv)
        db.commit()
        return {"message": "Invernadero eliminado correctamente"}
    except Exception as e:
        db.rollback()
        error_str = str(e)
        print(f"ERROR CRÍTICO AL ELIMINAR: {error_str}")
        if "violates foreign key constraint" in error_str:
            raise HTTPException(status_code=400, detail="No se puede eliminar: el invernadero tiene dispositivos o mediciones asociadas. Configure el borrado en cascada en la DB.")
        raise HTTPException(status_code=500, detail=f"Error interno: {error_str}")


class DispositivoCreate(BaseModel):
    nombre: str
    tipo: str
    estado: str = "Activo"
    ubicacion: str = None
    id_invernadero: int = None
    config_electronica: ElectronicConfig | None = None


def validar_fuente_electronica(dispositivo, db):
    config = dispositivo.config_electronica
    if config and config.fuente_esp32:
        source = db.get(Dispositivo, config.fuente_esp32)
        if not source or source.tipo.upper() != 'ESP32' or source.id_invernadero != dispositivo.id_invernadero:
            raise HTTPException(422, 'Selecciona un ESP32 del mismo invernadero')


@app.post("/dispositivos")
def crear_dispositivo(dispositivo: DispositivoCreate, db: Session = Depends(get_db)):
    """Registra un nuevo dispositivo en la base de datos."""
    validar_fuente_electronica(dispositivo, db)
    try:
        # Verificar duplicado por nombre dentro del mismo invernadero
        nombre_limpio = dispositivo.nombre.strip()
        existe = db.query(Dispositivo).filter(
            Dispositivo.nombre.ilike(nombre_limpio),
            Dispositivo.id_invernadero == dispositivo.id_invernadero
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail=f"El dispositivo '{nombre_limpio}' ya existe en este invernadero.")

        nuevo_disp = Dispositivo(
            nombre=dispositivo.nombre,
            tipo=dispositivo.tipo,
            estado=dispositivo.estado,
            ubicacion=dispositivo.ubicacion,
            id_invernadero=dispositivo.id_invernadero,
            config_electronica=dispositivo.config_electronica.model_dump() if dispositivo.config_electronica else None
        )
        db.add(nuevo_disp)
        db.commit()
        db.refresh(nuevo_disp)
        return {"message": "Dispositivo creado", "id": nuevo_disp.id_dispositivo}
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR POST /dispositivos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear dispositivo: {str(e)}")


@app.delete("/dispositivos/{id_disp}")
def eliminar_dispositivo(id_disp: int, db: Session = Depends(get_db)):
    """Elimina un dispositivo de la base de datos."""
    try:
        db_disp = db.query(Dispositivo).filter(Dispositivo.id_dispositivo == id_disp).first()
        if not db_disp:
            raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
        
        db.delete(db_disp)
        db.commit()
        return {"message": "Dispositivo eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar dispositivo: {str(e)}")


@app.put("/dispositivos/{id_disp}")
def actualizar_dispositivo(id_disp: int, dispositivo: DispositivoCreate, db: Session = Depends(get_db)):
    """Actualiza los datos de un dispositivo existente."""
    validar_fuente_electronica(dispositivo, db)
    try:
        db_disp = db.query(Dispositivo).filter(Dispositivo.id_dispositivo == id_disp).first()
        if not db_disp:
            raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
        
        # Verificar duplicado (excluyendo el actual) en el mismo invernadero
        nombre_limpio = dispositivo.nombre.strip()
        existe = db.query(Dispositivo).filter(
            Dispositivo.nombre.ilike(nombre_limpio),
            Dispositivo.id_invernadero == dispositivo.id_invernadero,
            Dispositivo.id_dispositivo != id_disp
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail=f"Otro dispositivo ya usa el nombre '{nombre_limpio}' en este invernadero.")

        db_disp.nombre = dispositivo.nombre
        db_disp.tipo = dispositivo.tipo
        db_disp.estado = dispositivo.estado
        db_disp.ubicacion = dispositivo.ubicacion
        db_disp.id_invernadero = dispositivo.id_invernadero
        if 'config_electronica' in dispositivo.model_fields_set:
            db_disp.config_electronica = dispositivo.config_electronica.model_dump() if dispositivo.config_electronica else None
        
        db.commit()
        return {"message": "Dispositivo actualizado correctamente"}
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR PUT /dispositivos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar: {str(e)}")


class RelatoCreate(BaseModel):
    nombre: str
    mensaje: str
    foto: str
    id_usuario: int


@app.post("/relatos")
def crear_relato(relato: RelatoCreate, db: Session = Depends(get_db)):
    nuevo_relato = Relato(**relato.dict())
    db.add(nuevo_relato)
    db.commit()
    db.refresh(nuevo_relato)
    return nuevo_relato


@app.get("/relatos/ultimo")
def obtener_ultimo_relato(db: Session = Depends(get_db)):
    relato = db.query(Relato).order_by(Relato.id_relato.desc()).first()
    if not relato:
        # Relato por defecto si no hay ninguno en la BD
        return {"nombre": "Cultura Agro", "mensaje": "Esperando tu historia...", "foto": None}
    return relato


@app.get("/relatos")
def listar_relatos(db: Session = Depends(get_db)):
    """Obtiene todos los relatos ordenados por el más reciente."""
    return db.query(Relato).order_by(Relato.id_relato.desc()).all()


class AnalisisSueloSchema(BaseModel):
    formulario: Optional[FormularioSuelo] = None
    id_muestra: Optional[str] = None
    fecha_muestreo: Optional[str] = None
    lote_sector: Optional[str] = None
    geolocalizacion: Optional[str] = None
    cultivo: Optional[str] = None
    profundidad: Optional[str] = None
    ph: Optional[str] = None
    ec: Optional[str] = None
    co2: Optional[str] = None
    mo: Optional[str] = None
    n: Optional[str] = None
    p: Optional[str] = None
    k: Optional[str] = None
    ca: Optional[str] = None
    mg: Optional[str] = None
    na: Optional[str] = None
    cic: Optional[str] = None
    sat_bases: Optional[str] = None
    sat_al: Optional[str] = None
    textura: Optional[str] = None
    densidad: Optional[str] = None
    humedad: Optional[str] = None
    estado_balance: Optional[str] = "Óptimo"
    recomendacion: Optional[str] = None


@app.get("/invernaderos/{id_inv}/analisis-suelo")
def obtener_analisis_suelo(id_inv: int, db: Session = Depends(get_db)):
    return db.query(AnalisisSuelo).filter(AnalisisSuelo.id_invernadero == id_inv).first()


@app.post("/invernaderos/{id_inv}/analisis-suelo")
def guardar_analisis_suelo(id_inv: int, data: AnalisisSueloSchema, db: Session = Depends(get_db)):
    if not db.query(Invernadero).filter(Invernadero.id_invernadero == id_inv).first():
        raise HTTPException(status_code=404, detail="Invernadero no encontrado")
    db_analisis = db.query(AnalisisSuelo).filter(AnalisisSuelo.id_invernadero == id_inv).first()
    if data.formulario is not None:
        form = data.formulario.model_dump(mode="json")
        # La versión nueva es la fuente completa. No reinterpretar los nutrientes históricos.
        values = {
            "formulario": form, "id_muestra": form["numero_muestra"],
            "fecha_muestreo": form["fecha_muestreo"], "lote_sector": form["lote_sector"],
            "geolocalizacion": form["geolocalizacion"], "cultivo": form["cultivo"],
            "textura": form["textura"],
        }
    else:
        # Compatibilidad con clientes anteriores, sin borrar columnas omitidas.
        values = data.model_dump(exclude_unset=True, exclude={"formulario"})
        if not values:
            raise HTTPException(status_code=422, detail="El análisis no puede estar vacío")
        if db_analisis and db_analisis.formulario:
            raise HTTPException(status_code=409, detail="Edita este análisis con el formulario actualizado")
        for key, value in values.items():
            if isinstance(value, str) and not value.strip():
                values[key] = None
    if db_analisis:
        for key, value in values.items():
            setattr(db_analisis, key, value)
    else:
        db_analisis = AnalisisSuelo(id_invernadero=id_inv, **values)
        db.add(db_analisis)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="No se pudo guardar el análisis de suelo")
    db.refresh(db_analisis)
    return {"message": "Análisis guardado exitosamente", "id_analisis": db_analisis.id_analisis, "formulario": db_analisis.formulario}


