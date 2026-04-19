import bcrypt
from database import SessionLocal
from models.usuario import Usuario
from sqlalchemy import text

def fix_admin():
    db = SessionLocal()
    try:
        # 1. Limpiar tabla (Recomendado para asegurar que no queden hashes corruptos)
        db.execute(text("TRUNCATE TABLE usuario RESTART IDENTITY CASCADE"))
        
        # 2. Generar el hash usando la librería del entorno actual (Python 3.14)
        password_plana = "CALDERON6542872a"
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_plana.encode('utf-8'), salt).decode('utf-8')
        
        # 3. Insertar el usuario Marco como Admin
        admin = Usuario(
            nombres="Marco",
            apellidos="Calderon",
            correo="ac8858715@gmail.com",
            celular="77777777",
            password=hashed
        )
        db.add(admin)
        db.commit()
        print("¡Usuario admin creado exitosamente con el hash correcto!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin()