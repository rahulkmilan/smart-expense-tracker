from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional
from decimal import Decimal

DB_PATH = "expenses.db"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    name: str
    email: str

class Category(BaseModel):
    name: str

class Expense(BaseModel):
    user_id: int
    category_id: int
    amount: Decimal
    date: str
    note: Optional[str] = None

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.post("/api/users")
def create_user(user: User):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO users (name, email) VALUES (?, ?)", (user.name, user.email))
    conn.commit()
    return {"id": cur.lastrowid, **user.dict()}

@app.get("/api/users")
def list_users():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    return [dict(row) for row in cur.fetchall()]

@app.post("/api/categories")
def create_category(category: Category):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO categories (name) VALUES (?)", (category.name,))
    conn.commit()
    return {"id": cur.lastrowid, **category.dict()}

@app.get("/api/categories")
def list_categories():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM categories")
    return [dict(row) for row in cur.fetchall()]

@app.post("/api/expenses")
def create_expense(expense: Expense):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (?, ?, ?, ?, ?)",
        (expense.user_id, expense.category_id, float(expense.amount), expense.date, expense.note),
    )
    conn.commit()
    return {"id": cur.lastrowid, **expense.dict()}

@app.get("/api/expenses")
def list_expenses(user_id: Optional[int] = None):
    conn = get_db()
    cur = conn.cursor()
    if user_id:
        cur.execute("SELECT * FROM expenses WHERE user_id = ?", (user_id,))
    else:
        cur.execute("SELECT * FROM expenses")
    return [dict(row) for row in cur.fetchall()]

@app.get("/api/reports/monthly_summary")
def monthly_summary(user_id: int, year: str, month: str):
    conn = get_db()
    cur = conn.cursor()
    query = """
        SELECT c.name AS category, SUM(e.amount) AS total
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ? AND strftime('%Y', e.date) = ? AND strftime('%m', e.date) = ?
        GROUP BY c.name
    """
    cur.execute(query, (user_id, year, month))
    return [dict(row) for row in cur.fetchall()]
