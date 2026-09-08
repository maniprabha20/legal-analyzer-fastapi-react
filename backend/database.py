import os

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase


DATABASE_URL = os.getenv("DATABASE_URL")


# The engine manages the actual connection pool to Postgres
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"statement_cache_size": 0},
)


# The session factory creates individual DB sessions per request
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Every ORM model (table) will inherit from this."""
    pass


# Provides a database session for each request
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session