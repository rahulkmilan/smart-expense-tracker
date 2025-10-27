# Smart Expense Tracker

A **personal expense tracking application** that supports multiple users. Users can log expenses, view monthly summaries, and analyze spending by category. Built with **FastAPI** (backend), **SQLite** (database), and **React + Vite** (frontend).

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Setup Instructions](#setup-instructions)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Design Choices & Assumptions](#design-choices--assumptions)
7. [Usage](#usage)
8. [Optional Improvements](#optional-improvements)

---

## Features

- Multi-user support
- Expense logging with categories, date, amount, and notes
- Monthly summary report by category
- Interactive React UI to add/view expenses and reports
- Sample data included for testing

---

## Tech Stack

- **Backend:** Python 3.9+, FastAPI
- **Database:** SQLite
- **Frontend:** React + Vite
- **API Client:** fetch (native)

---

## Setup Instructions

### Prerequisites

- Python 3.9+ installed
- Node.js 20.19+ or 22.12+ installed
- Git (optional, if cloning repository)

---

### 1. Clone Project

```bash
git clone <repo-url>
cd SmartExpenseTracker
````

### 2. Backend Setup

1. Create virtual environment:

```powershell
python -m venv venv
```

2. Activate virtual environment:

```powershell
# Windows PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\activate
```

3. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

4. Initialize SQLite database with schema:

```powershell
python -c "import sqlite3; conn = sqlite3.connect('expenses.db'); conn.executescript(open('backend/schema.sql').read()); conn.close()"
```

5. Insert sample data (optional):

```powershell
python -c "import sqlite3; conn = sqlite3.connect('expenses.db'); conn.executescript(open('backend/data.sql').read()); conn.close()"
```

6. Run FastAPI server:

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

Server runs at: `http://127.0.0.1:8000`
Swagger docs available at: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

1. Navigate to frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Run Vite development server:

```powershell
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Database Schema

**Users Table**

| Column | Type                | Description |
| ------ | ------------------- | ----------- |
| id     | INTEGER PRIMARY KEY | User ID     |
| name   | TEXT                | User name   |
| email  | TEXT                | User email  |

**Categories Table**

| Column | Type                | Description   |
| ------ | ------------------- | ------------- |
| id     | INTEGER PRIMARY KEY | Category ID   |
| name   | TEXT                | Category name |

**Expenses Table**

| Column      | Type                | Description                   |
| ----------- | ------------------- | ----------------------------- |
| id          | INTEGER PRIMARY KEY | Expense ID                    |
| user_id     | INTEGER             | Foreign key to users(id)      |
| category_id | INTEGER             | Foreign key to categories(id) |
| amount      | DECIMAL             | Expense amount                |
| date        | DATE                | Expense date                  |
| note        | TEXT                | Optional note                 |

---

## API Endpoints

| Method | Endpoint                                                       | Description               |
| ------ | -------------------------------------------------------------- | ------------------------- |
| POST   | `/api/users`                                                   | Create a new user         |
| GET    | `/api/users`                                                   | List all users            |
| POST   | `/api/categories`                                              | Create new category       |
| GET    | `/api/categories`                                              | List all categories       |
| POST   | `/api/expenses`                                                | Add new expense           |
| GET    | `/api/expenses?user_id=<id>`                                   | Fetch expenses for a user |
| GET    | `/api/reports/monthly_summary?user_id=<id>&year=YYYY&month=MM` | Monthly summary report    |

---

## Design Choices & Assumptions

1. **DECIMAL for amount** — ensures precise monetary calculations (avoids float rounding errors).
2. **Foreign key constraints** — ensures data integrity for users and categories.
3. **Passing `user_id` in API requests** — simple for proof-of-concept; not secure for production.
4. **Monthly report aggregation in SQL** — faster for large datasets, reduces backend processing.

---

## Usage

1. Start backend server (`uvicorn`)
2. Start frontend (`npm run dev`)
3. Open frontend in browser
4. Select a user → Add expenses → View list → Generate monthly report

---

## Optional Improvements (Tier 3)

* Full CRUD operations for expenses
* JWT-based authentication for multi-user security
* Form validations (amount > 0, required fields)
* Data visualization (pie chart/bar chart) for monthly report
* Dockerization for easy deployment

```
