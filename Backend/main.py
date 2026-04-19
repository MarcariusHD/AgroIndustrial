from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base, get_db
from routers import usuario_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error al conectar a la DB durante el inicio: {e}")

# Incluimos las rutas
app.include_router(usuario_router.router)

@app.get("/")
def root():
    return {"message": "API de AgroIndustrial Funcionando"}