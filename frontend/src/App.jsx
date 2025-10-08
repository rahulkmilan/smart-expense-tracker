import React, { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

export default function App() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [userId, setUserId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [report, setReport] = useState([]);

  useEffect(() => {
    fetch(`${API}/users`).then(r => r.json()).then(setUsers);
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories);
  }, []);

  const fetchExpenses = () => {
    if (!userId) return alert("Select a user first");
    fetch(`${API}/expenses?user_id=${userId}`).then(r => r.json()).then(setExpenses);
  };

  const addExpense = () => {
    if (!userId || !categoryId || !amount || !date) return alert("Fill all fields");
    fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: Number(userId), category_id: Number(categoryId), amount, date, note })
    }).then(() => {
      fetchExpenses();
      setAmount(""); setNote(""); setCategoryId(""); setDate("");
    });
  };

  const getReport = () => {
    if (!userId || !date) return alert("Select a user and date");
    const [year, month] = date.split("-");
    fetch(`${API}/reports/monthly_summary?user_id=${userId}&year=${year}&month=${month}`)
      .then(r => r.json()).then(setReport);
  };

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  };

  const inputStyle = {
    padding: 8,
    margin: "5px 0",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 4,
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    padding: "10px 20px",
    margin: "10px 5px 0 0",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff"
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Smart Expense Tracker</h1>

      {/* User & Expense Form */}
      <div style={cardStyle}>
        <h2>Add Expense</h2>
        <label>User:</label>
        <select style={inputStyle} value={userId} onChange={e => setUserId(e.target.value)}>
          <option value="">Select User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <label>Category:</label>
        <select style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label>Amount:</label>
        <input type="number" style={inputStyle} placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />

        <label>Date:</label>
        <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />

        <label>Note:</label>
        <input type="text" style={inputStyle} placeholder="Optional note" value={note} onChange={e => setNote(e.target.value)} />

        <div>
          <button style={buttonStyle} onClick={addExpense}>Add Expense</button>
          <button style={{ ...buttonStyle, backgroundColor: "#28a745" }} onClick={fetchExpenses}>View Expenses</button>
          <button style={{ ...buttonStyle, backgroundColor: "#ffc107", color: "#000" }} onClick={getReport}>Monthly Report</button>
        </div>
      </div>

      {/* Expense List */}
      <div style={cardStyle}>
        <h2>Expenses</h2>
        {expenses.length === 0 ? <p>No expenses found.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Date</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Category</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Amount</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: 8 }}>{e.date}</td>
                  <td style={{ padding: 8 }}>{categories.find(c => c.id === e.category_id)?.name || ""}</td>
                  <td style={{ padding: 8 }}>₹{e.amount}</td>
                  <td style={{ padding: 8 }}>{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly Report */}
      <div style={cardStyle}>
        <h2>Monthly Report</h2>
        {report.length === 0 ? <p>No data yet.</p> : (
          <ul>
            {report.map(r => (
              <li key={r.category}><strong>{r.category}</strong>: ₹{r.total}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
