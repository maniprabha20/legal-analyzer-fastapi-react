import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv()  # reads .env into environment variables

DATABASE_URL = os.getenv("DATABASE_URL")

# The engine manages the actual connection pool to Postgres
engine = create_async_engine(DATABASE_URL, echo=True)

# The session factory creates individual DB sessions per request
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Every ORM model (table) will inherit from this."""
    pass


async def get_db():
    """Dependency: yields a DB session, closes it automatically after use."""
    async with AsyncSessionLocal() as session:
        yield session