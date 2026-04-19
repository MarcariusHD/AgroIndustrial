from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:CALDERON@127.0.0.1:5432/AGROINDUSTRIAL"

engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    connect_args={'connect_timeout': 5}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()