import os
from getpass import getpass
import bcrypt
from database import SessionLocal
from models.usuario import Usuario
from models.rol import Rol
from models.usuario_rol import UsuarioRol
from sqlalchemy import text

def fix_admin():
    password_plana = os.getenv('ADMIN_PASSWORD') or getpass('Contraseña del administrador: ')
    if not password_plana:
        raise ValueError('La contraseña no puede estar vacía')
    db = SessionLocal()
    try:
        # 1. Limpiar tablas relacionadas
        db.execute(text("TRUNCATE TABLE usuario, rol, usuario_rol RESTART IDENTITY CASCADE"))
        
        # 2. Generar el hash usando la librería del entorno actual (Python 3.14)
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_plana.encode('utf-8'), salt).decode('utf-8')
        
        # 3. Crear Roles básicos para poder alternar entre ellos
        rol_admin = Rol(nombre_rol="admin")
        rol_user = Rol(nombre_rol="user")
        db.add(rol_admin)
        db.add(rol_user)
        db.flush() 

        # 4. Insertar el usuario Marco
        admin = Usuario(
            nombres="Marco",
            apellidos="Calderon",
            correo="ac8858715@gmail.com",
            celular="77777777",
            password=hashed
        )
        db.add(admin)
        db.flush() # Para obtener el id_usuario generado

        # 5. Vincular Usuario con Rol
        vinculo = UsuarioRol(id_usuario=admin.id_usuario, id_rol=rol_admin.id_rol)
        db.add(vinculo)

        db.commit()
        print("¡Estructura de Admin creada (Tablas: usuario, rol, usuario_rol)!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin()