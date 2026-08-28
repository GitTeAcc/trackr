import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { addTransaction, getCategories } from "../services/api";
import "../styles/add-transaction.css";

export default function AddTransaction() {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    tags: "",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.category) {
      return setError("Amount and category are required");
    }
    if (Number(form.amount) <= 0) {
      return setError("Amount must be greater than 0");
    }

    setLoading(true);
    try {
      await addTransaction({
        ...form,
        amount: Number(form.amount),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      setSuccess(true);
      setForm({ type: "expense", amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0], tags: "" });
      setTimeout(() => navigate("/transactions"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.type === form.type || c.type === "both"
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1>Add Transaction</h1>
          <p>Record a new income or expense</p>
        </div>

        <div className="add-transaction-wrap">
          <div className="card">
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">Transaction added! Redirecting...</div>}

            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${form.type === "expense" ? "active expense" : ""}`}
                onClick={() => setForm({ ...form, type: "expense", category: "" })}
              >
                📤 Expense
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === "income" ? "active income" : ""}`}
                onClick={() => setForm({ ...form, type: "income", category: "" })}
              >
                📥 Income
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount (₹)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {filteredCategories.map((c) => (
                      <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="What was this for?"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (optional, comma-separated)</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="e.g. groceries, weekly, essential"
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
