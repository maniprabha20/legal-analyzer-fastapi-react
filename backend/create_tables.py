import asyncio
from database import engine, Base
import models


async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("All tables created successfully.")


if __name__ == "__main__":
    asyncio.run(create_all())