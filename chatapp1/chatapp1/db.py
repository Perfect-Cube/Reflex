import duckdb
import datetime

DB_FILE = "chat_history.db"

def get_connection():
    return duckdb.connect(DB_FILE)

def create_tables():
    with get_connection() as conn:
        # The SQL command is a multi-line string.
        # Comments should be outside of the triple quotes.
        conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                user_id VARCHAR,
                role VARCHAR,
                content VARCHAR,
                timestamp TIMESTAMP
            )
        """)

def add_message(user_id, role, content):
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO messages (user_id, role, content, timestamp) VALUES (?, ?, ?, ?)",
            (user_id, role, content, datetime.datetime.now())
        )

def get_history(user_id):
    with get_connection() as conn:
        return conn.execute(
            "SELECT role, content FROM messages WHERE user_id = ? ORDER BY timestamp",
            (user_id,)
        ).fetchall()

# Initialize the database and table when the app starts
create_tables()