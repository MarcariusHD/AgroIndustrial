from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import bcrypt
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate

def registrar_usuario_logic(db: Session, usuario: UsuarioCreate):
    salt = bcrypt.gensalt()
    password_segura = bcrypt.hashpw(usuario.password.encode('utf-8'), salt).decode('utf-8')
    nuevo_usuario = Usuario(
        nombres=usuario.nombres,
        apellidos=usuario.apellidos,
        correo=usuario.correo.strip().lower(),
        celular=usuario.celular,
        password=password_segura
    )
    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        return {"status": "success", "message": "Registro Realizado"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Este correo ya está registrado.")

def obtener_usuario_logic(db: Session):
    return db.query(Usuario).all()