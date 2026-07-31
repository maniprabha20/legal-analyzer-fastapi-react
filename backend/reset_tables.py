import asyncio
from database import engine, Base
import models  # noqa: F401


async def reset_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("All tables dropped and recreated.")


if __name__ == "__main__":
    asyncio.run(reset_all())