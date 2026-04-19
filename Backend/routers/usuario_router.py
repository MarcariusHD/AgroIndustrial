from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.usuario import UsuarioCreate, UsuarioOut
from controllers.usuario_controller import registrar_usuario_logic, obtener_usuario_logic

router = APIRouter()

@router.post("/registro")
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return registrar_usuario_logic(db, usuario)

@router.get("/usuario", response_model=List[UsuarioOut])
def obtener_usuario(db: Session = Depends(get_db)):
    return obtener_usuario_logic(db)