# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, EmailStr, constr
from typing import Optional, List, Dict, Any
import sqlite3
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from decimal import Decimal

# CONFIG
DB_PATH = "expenses1.db"
SECRET_KEY = "your_key"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

app = FastAPI(title="Smart Expense Tracker")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Utilities
# -------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    return row

def get_user_by_id(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row

# -------------------------
# Pydantic models
# -------------------------
class UserCreate(BaseModel):
    name: constr(min_length=1) # type: ignore
    email: EmailStr
    password: constr(min_length=6) # type: ignore

class UserOut(BaseModel):
    id: int
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CategoryIn(BaseModel):
    name: constr(min_length=1) # type: ignore

class CategoryOut(BaseModel):
    id: int
    name: str

class ExpenseBase(BaseModel):
    category_id: int
    amount: Decimal = Field(..., gt=0)
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')  # YYYY-MM-DD
    note: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category_id: Optional[int]
    amount: Optional[Decimal]
    date: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')  # YYYY-MM-DD
    note: Optional[str]

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    date: str
    note: Optional[str]

# -------------------------
# Auth dependencies
# -------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials (token invalid or expired)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(int(user_id))
    if user is None:
        raise credentials_exception
    # convert row to dict-like
    return dict(user)

# -------------------------
# Auth endpoints
# -------------------------
@app.post("/api/register", response_model=UserOut)
def register(user: UserCreate):
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(user.password) > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 characters)")
    conn = get_db()
    cur = conn.cursor()
    pw_hash = get_password_hash(user.password)
    cur.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (user.name, user.email, pw_hash))
    conn.commit()
    user_id = cur.lastrowid
    conn.close()
    return {"id": user_id, "name": user.name, "email": user.email}

@app.post("/api/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data has username and password — username will be email
    user_row = get_user_by_email(form_data.username)
    if not user_row:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(form_data.password, user_row["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user_row["id"])}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------
# Category endpoints
# -------------------------
@app.post("/api/addcategories", response_model=CategoryOut)
def create_category(payload: CategoryIn, current_user: dict = Depends(get_current_user)):
    # categories are global; only require auth to create
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO categories (name) VALUES (?)", (payload.name,))
        conn.commit()
        cid = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Category already exists")
    conn.close()
    return {"id": cid, "name": payload.name}

@app.get("/api/getcategories", response_model=List[CategoryOut])
def list_categories(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM categories ORDER BY name")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------
# Expense endpoints (CRUD)
# -------------------------
@app.post("/api/addexpenses", response_model=ExpenseOut)
def create_expense(payload: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # verify category exists
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM categories WHERE id = ?", (payload.category_id,))
    if cur.fetchone() is None:
        conn.close()
        raise HTTPException(status_code=400, detail="category_id not found")
    cur.execute(
        "INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (?, ?, ?, ?, ?)",
        (current_user["id"], payload.category_id, str(payload.amount), payload.date, payload.note)
    )
    conn.commit()
    eid = cur.lastrowid
    cur.execute("SELECT * FROM expenses WHERE id = ?", (eid,))
    row = cur.fetchone()
    conn.close()
    # convert amount to Decimal for response
    out = dict(row)
    out["amount"] = Decimal(str(out["amount"]))
    return out

@app.get("/api/getexpenses", response_model=List[ExpenseOut])
def get_expenses(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, category_id, amount, date, note FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC", (current_user["id"],))
    rows = cur.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["amount"] = Decimal(str(d["amount"]))
        result.append(d)
    return result

@app.put("/api/editexpenses/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, payload: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    # verify ownership
    cur.execute("SELECT * FROM expenses WHERE id = ? AND user_id = ?", (expense_id, current_user["id"]))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Expense not found")
    # build update set dynamically
    fields = []
    values = []
    if payload.category_id is not None:
        fields.append("category_id = ?"); values.append(payload.category_id)
    if payload.amount is not None:
        fields.append("amount = ?"); values.append(str(payload.amount))
    if payload.date is not None:
        fields.append("date = ?"); values.append(payload.date)
    if payload.note is not None:
        fields.append("note = ?"); values.append(payload.note)
    if fields:
        sql = f"UPDATE expenses SET {', '.join(fields)} WHERE id = ?"
        values.append(expense_id)
        cur.execute(sql, tuple(values))
        conn.commit()
    cur.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,))
    updated = cur.fetchone()
    conn.close()
    out = dict(updated)
    out["amount"] = Decimal(str(out["amount"]))
    return out

@app.delete("/api/deleteexpenses/{expense_id}")
def delete_expense(expense_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM expenses WHERE id = ? AND user_id = ?", (expense_id, current_user["id"]))
    if cur.fetchone() is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Expense not found")
    cur.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return {"detail": "Expense deleted"}

# -------------------------
# Monthly summary (single SQL)
# -------------------------
@app.get("/api/reports/monthly_summary")
def monthly_summary(year: str, month: str, current_user: dict = Depends(get_current_user)):
    # normalize month
    if len(month) == 1:
        month = month.zfill(2)
    sql = """
    SELECT
      c.name AS category_name,
      SUM(e.amount) AS total_amount
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ?
      AND strftime('%Y', e.date) = ?
      AND strftime('%m', e.date) = ?
    GROUP BY c.name
    ORDER BY total_amount DESC
    """
    conn = get_db()
    cur = conn.cursor()
    cur.execute(sql, (current_user["id"], year, month))
    rows = cur.fetchall()
    # total
    total = Decimal("0")
    expenses_by_category = []
    for r in rows:
        amt = Decimal(str(r["total_amount"] or 0))
        expenses_by_category.append({"category_name": r["category_name"], "total_amount": format(amt, "f")})
        total += amt
    conn.close()
    return {"total_expenses": format(total, "f"), "expenses_by_category": expenses_by_category}

