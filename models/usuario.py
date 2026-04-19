from sqlalchemy import Column, Integer, String
from database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombres = Column(String)
    apellidos = Column(String)
    correo = Column(String, unique=True, index=True)
    celular = Column(String)
    password = Column(String)