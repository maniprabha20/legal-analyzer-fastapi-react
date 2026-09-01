from models import User
from database import AsyncSessionLocal
from security import hash_password
import asyncio


async def create_user():

    async with AsyncSessionLocal() as db:

        user = User(
            email="test@gmail.com",
            hashed_password=hash_password("test123")
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        print("User created successfully")
        print("User ID:", user.id)


asyncio.run(create_user())