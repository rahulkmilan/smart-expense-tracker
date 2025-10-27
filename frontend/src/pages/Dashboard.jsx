import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const API = "http://localhost:8000/api";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57"];

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Shared styles
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  marginBottom: "12px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "14px",
};

const baseButtonStyle = {
  padding: "8px 14px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [report, setReport] = useState(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API}/getcategories`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
      if (data.length && !categoryId) setCategoryId(data[0].id);
    } else if (res.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  };

  const fetchExpenses = async () => {
    const res = await fetch(`${API}/getexpenses`, { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      setExpenses(data);
    } else if (res.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  };

  const addOrUpdateExpense = async () => {
    if (!categoryId || !amount || !date) return alert("Fill all required fields");

    const payload = {
      category_id: Number(categoryId),
      amount,
      date,
      note,
    };

    const url = editingId
      ? `${API}/editexpenses/${editingId}`
      : `${API}/addexpenses`;

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert(editingId ? "Update failed" : "Add failed");
    } else {
      setEditingId(null);
      setAmount("");
      setDate("");
      setNote("");
      fetchExpenses();
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setCategoryId(expense.category_id);
    setAmount(expense.amount);
    setDate(expense.date);
    setNote(expense.note || "");
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    const res = await fetch(`${API}/deleteexpenses/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.ok) fetchExpenses();
    else alert("Delete failed");
  };

  const getReport = async () => {
    const res = await fetch(
      `${API}/reports/monthly_summary?year=${reportYear}&month=${String(
        reportMonth
      ).padStart(2, "0")}`,
      { headers: authHeaders() }
    );
    if (!res.ok) return alert("Failed to fetch report");

    const data = await res.json();
    setReport(data);
  };

  return (
    <div style={{ maxWidth: 1024, margin: "20px auto", padding: "0 16px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Smart Expense Tracker</h1>
        <button
          onClick={logout}
          style={{ ...baseButtonStyle, background: "#e74c3c", color: "#fff" }}
        >
          Logout
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Add/Edit Expense Form */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8}}>
          <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit Expense" : "Add Expense"}</h3>

          <label>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />

          <label>Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
          />

          <div style={{ marginTop: 12 }}>
            <button
              onClick={addOrUpdateExpense}
              style={{ ...baseButtonStyle, background: "#2ecc71", color: "#fff" }}
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setAmount("");
                  setDate("");
                  setNote("");
                }}
                style={{
                  ...baseButtonStyle,
                  background: "#95a5a6",
                  color: "#fff",
                  marginLeft: 8,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Report Section */}
        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
          <h3 style={{ marginBottom: 12 }}>Monthly Report</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <input
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              style={{ ...inputStyle, width: 100, marginBottom: 0 }}
            />
            <input
              type="number"
              value={reportMonth}
              onChange={(e) =>
                setReportMonth(Math.min(12, Math.max(1, Number(e.target.value))))
              }
              style={{ ...inputStyle, width: 80, marginBottom: 0 }}
              min={1}
              max={12}
            />
            <button
              onClick={getReport}
              style={{ ...baseButtonStyle, background: "#3498db", color: "#fff" }}
            >
              Get Report
            </button>
          </div>

          {report && report.expenses_by_category?.length > 0 ? (
            <div style={{ textAlign: "center" }}>
              <h4>Total: ₹{report.total_expenses}</h4>
             
              <PieChart width={320} height={260}>
                <Pie
                  data={report.expenses_by_category.map((x) => ({
                    name: x.category_name,
                    value: Number(x.total_amount),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {report.expenses_by_category.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          ) : (
            report && <p>No report data available for this month.</p>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div
        style={{
          marginTop: 32,
          border: "1px solid #ddd",
          padding: 20,
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 16 }}>Your Expenses</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Category</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Amount</th>
              <th style={{ padding: "10px" }}>Note</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{e.date}</td>
                  <td style={{ padding: "10px" }}>
                    {(categories.find((c) => c.id === e.category_id) || {}).name}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{e.amount}</td>
                  <td style={{ padding: "10px" }}>{e.note}</td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => startEdit(e)}
                      style={{
                        ...baseButtonStyle,
                        background: "#f1c40f",
                        color: "#000",
                        marginRight: 6,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      style={{
                        ...baseButtonStyle,
                        background: "#e67e22",
                        color: "#fff",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: "16px", textAlign: "center" }}>
                  No expenses recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button
            onClick={fetchExpenses}
            style={{
              ...baseButtonStyle,
              background: "#3498db",
              color: "#fff",
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
