PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  note TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- sample categories
INSERT INTO categories (name) VALUES ('Groceries');
INSERT INTO categories (name) VALUES ('Utilities');
INSERT INTO categories (name) VALUES ('Transport');
INSERT INTO categories (name) VALUES ('Entertainment');
