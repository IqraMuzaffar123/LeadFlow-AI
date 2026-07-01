import asyncpg
from app.config import settings

pool: asyncpg.Pool | None = None


def _get_asyncpg_url() -> str:
    url = settings.database_url
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql://", 1)
    return url


async def init_db():
    global pool
    pool = await asyncpg.create_pool(
        dsn=_get_asyncpg_url(),
        min_size=2,
        max_size=10,
    )


async def close_db():
    global pool
    if pool:
        await pool.close()


async def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool
