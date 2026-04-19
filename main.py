from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from Controllers.usuario_controller import registrar_usuario_logic, obtener_usuario_logic
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioOut
from pydantic import BaseModel, EmailStr
import bcrypt
from typing import List

# Crea las tablas de la base de datos al iniciar
Base.metadata.create_all(bind=engine)

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

# Permite servir las imágenes del carrusel si están en esa carpeta
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dependencia para obtener la sesión de DB en cada ruta
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    
    # Por ahora, como acabas de crear la tabla intermedia, simularemos el envío del rol
    # En el siguiente paso, haremos la consulta a la tabla usuario_rol
    # Agregamos tu correo para que el sistema te permita ver el Dashboard
    rol_usuario = "admin" if "admin" in user.correo or user.correo == "ac8858715@gmail.com" else "user" 
    
    print(f"Resultado: ¡Login exitoso para {user.correo}! Rol detectado: {rol_usuario}")
    return {"message": "Inicio de sesión exitoso", "usuario": user.correo, "rol": rol_usuario}

@app.get("/usuario", response_model=List[UsuarioOut])
def obtener_usuario(db: Session = Depends(get_db)):
    # Llama a la lógica definida en tu controlador
    return obtener_usuario_logic(db)

@app.get("/healthcheck")
def verificar_base_de_datos(db: Session = Depends(get_db)):
    try:
        # Ejecuta una consulta simple de SQL
        db.execute(text("SELECT 1"))
        return {"status": "conectado", "database": "PostgreSQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")