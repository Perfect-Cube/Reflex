import redis
from core.config import settings

redis_client = None

try:
    # A connection pool is more efficient for web applications than creating a new connection for every request.
    # decode_responses=True is very helpful as it decodes all responses from bytes to utf-8 strings.
    pool = redis.ConnectionPool(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
        decode_responses=True
    )
    redis_client = redis.Redis(connection_pool=pool)
    
    # Check if the connection is successful by sending a PING command.
    redis_client.ping()
    print("✅ Successfully connected to Redis.")

except redis.exceptions.ConnectionError as e:
    print(f"⚠️ Could not connect to Redis: {e}")
    print("Caching will be disabled. The application will run, but performance may be affected.")
    redis_client = None

except Exception as e:
    print(f"An unexpected error occurred with Redis: {e}")
    redis_client = None