### 🧾 **README.md**

````markdown
# 💰 Expense Tracker (FastAPI + React + SQLite)

A simple expense management web app built with **FastAPI (Python)** for the backend, **React** for the frontend, and **SQLite** as the database.

---

## 🚀 Features
- User Registration & Login (JWT Token Authentication)
- Add, View, and Delete Expenses
- Dashboard to view expense summary
- Secure API with FastAPI backend
- Responsive React frontend

---

## 🧩 Tech Stack
**Frontend:** React, React Router  
**Backend:** FastAPI, Python  
**Database:** SQLite (`expenses1.db`)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone <repo-url>
cd expense-tracker
````

---

### 2️⃣ Backend Setup (FastAPI)

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate       # Mac/Linux
   venv\Scripts\activate          # Windows
   ```

3. Install dependencies:

   ```bash
   pip install fastapi uvicorn python-multipart sqlalchemy passlib[bcrypt] jose sqlite3
   ```

4. Run the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

   * Server runs at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
   * Docs available at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

### 3️⃣ Frontend Setup (React)

1. Navigate to frontend folder:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run React app:

   ```bash
   npm start
   ```

   * App runs at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 API Endpoints

| Method   | Endpoint              | Description               |
| -------- | --------------------- | ------------------------- |
| `POST`   | `/register`           | Register new user         |
| `POST`   | `/token`              | Get JWT access token      |
| `GET`    | `/getproducts`        | Get all expenses/products |
| `POST`   | `/addproduct`         | Add new expense/product   |
| `DELETE` | `/deleteproduct/{id}` | Delete expense/product    |

---

## 🗄️ Database

SQLite database: **expenses1.db**

Example command to add a new column:

```sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

---

## 🔐 Authentication

* Login returns a **JWT token**.
* Token must be stored in **localStorage**.
* Use token for protected routes.

Example Response:

```json
{
  "access_token": "your_token_here",
  "token_type": "bearer"
}
```

---

## 🧰 Folder Structure

```
project/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── expenses1.db
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── Dashboard.js
│   │   └── App.js
│   ├── package.json
│
└── README.md
```

---

## 🧑‍💻 Author

**Rahul K Milan**
Junior Software Engineer @ Seguro Technologies
📧 [[rahulkmilan93@gmail.com](mailto:rahulkmilan93@gmail.com)]

---

## 🏁 License

This project is open-source and free to use.
