from pydantic import BaseModel, Field, EmailStr, field_validator

class UsuarioCreate(BaseModel):
    nombres: str = Field(..., min_length=1, max_length=30, pattern=r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$")
    apellidos: str = Field(..., min_length=1, max_length=35, pattern=r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$")
    correo: EmailStr
    celular: str = Field(..., pattern=r"^[67]\d{6,7}$")
    password: str = Field(..., min_length=10, max_length=20)

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if not any(c.islower() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra minúscula")
        if not any(c.isupper() for c in v):
            raise ValueError("La contraseña debe tener al menos una letra mayúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener al menos un número")
        return v

class UsuarioOut(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    correo: str
    celular: str

    class Config:
        from_attributes = True