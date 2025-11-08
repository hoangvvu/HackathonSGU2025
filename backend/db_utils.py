# db_utils.py
import pyodbc
import os

# Có thể đọc từ .env; ở đây mình đồng bộ với app.py để chạy ngay
DB_SERVER   = r'LAPTOP-UE0L3QPE\SQLEXPRESS'
DB_DATABASE = 'hackathon'
DB_USERNAME = 'sa'
DB_PASSWORD = 'anhkhoa020305'
DB_DRIVER   = '{ODBC Driver 17 for SQL Server}'

CONNECTION_STRING = (
    f"DRIVER={DB_DRIVER};SERVER={DB_SERVER};DATABASE={DB_DATABASE};"
    f"UID={DB_USERNAME};PWD={DB_PASSWORD}"
)

def get_db_conn():
    return pyodbc.connect(CONNECTION_STRING)

def query_db(query, params=()):
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute(query, params)
        cols = [c[0] for c in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
    except Exception as e:
        print("❌ Lỗi query:", e)
        return []
    finally:
        conn.close()

def execute_insert_return_id(sql, params=()):
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()  # vì dùng OUTPUT INSERTED.id
        conn.commit()
        return int(row[0]) if row else None
    except Exception as e:
        print("❌ Lỗi insert:", e)
        conn.rollback()
        return None
    finally:
        conn.close()
