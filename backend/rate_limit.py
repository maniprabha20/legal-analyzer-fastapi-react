from collections import defaultdict
from time import monotonic

from fastapi import Depends, HTTPException, Request

from auth import get_current_user
from models import User


RATE_LIMITS = {
    "ask": 10,
    "analyze": 5,
}

WINDOW_SECONDS = 60

_request_history = defaultdict(list)


def rate_limiter(action: str):

    if action not in RATE_LIMITS:
        raise ValueError(f"Unknown rate limit action: {action}")

    async def limiter(
        request: Request,
        current_user: User = Depends(get_current_user),
    ):
        user_id = current_user.id
        now = monotonic()

        key = (user_id, action)

        _request_history[key] = [
            timestamp
            for timestamp in _request_history[key]
            if now - timestamp < WINDOW_SECONDS
        ]

        if len(_request_history[key]) >= RATE_LIMITS[action]:
            raise HTTPException(
                status_code=429,
                detail=f"Too many {action} requests. Please try again later.",
            )

        _request_history[key].append(now)

        return current_user

    return limiter