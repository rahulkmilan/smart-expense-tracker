-- Users
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');

-- Categories
INSERT INTO categories (name) VALUES ('Groceries');
INSERT INTO categories (name) VALUES ('Utilities');
INSERT INTO categories (name) VALUES ('Transport');
INSERT INTO categories (name) VALUES ('Entertainment');

-- Expenses for Alice
INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (1, 1, 120.50, '2025-09-05', 'Weekly groceries');
INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (1, 2, 60.00, '2025-09-10', 'Electricity bill');
INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (1, 1, 80.25, '2025-09-21', 'Groceries top-up');

-- Expenses for Bob
INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (2, 3, 15.00, '2025-09-12', 'Bus pass');
INSERT INTO expenses (user_id, category_id, amount, date, note) VALUES (2, 4, 30.00, '2025-09-20', 'Movie night');
