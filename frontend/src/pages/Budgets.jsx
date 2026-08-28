import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getBudgets, setBudget, deleteBudget, getCategories } from "../services/api";
import "../styles/budgets.css";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Budgets() {
  const [budgets, setBudgetsState] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", limit: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [budRes, catRes] = await Promise.all([
        getBudgets({ month, year }),
        getCategories(),
      ]);
      setBudgetsState(budRes.data);
      setCategories(catRes.data.filter((c) => c.type === "expense" || c.type === "both"));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category || !form.limit) return setError("Category and limit are required");
    if (Number(form.limit) <= 0) return setError("Limit must be greater than 0");

    setLoading(true);
    try {
      await setBudget({ category: form.category, limit: Number(form.limit), month, year });
      setForm({ category: "", limit: "" });
      setShowForm(false);
      setError("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set budget");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this budget?")) return;
    try {
      await deleteBudget(id);
      setBudgetsState((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert("Failed to remove budget");
    }
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent    = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct    = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Budgets</h1>
            <p>{monthName}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Set Budget"}
          </button>
        </div>

        {budgets.length > 0 && (
          <div className="card budget-overview">
            <div className="budget-overview-stat">
              <div className="stat-label">Total Budgeted</div>
              <div className="stat-value">{formatCurrency(totalBudgeted)}</div>
            </div>
            <div className="budget-overview-stat">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value" style={{ color: totalSpent > totalBudgeted ? "var(--danger)" : "var(--text-dark)" }}>
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div className="budget-overview-stat">
              <div className="stat-label">Remaining</div>
              <div className="stat-value" style={{ color: "var(--green-primary)" }}>
                {formatCurrency(Math.max(totalBudgeted - totalSpent, 0))}
              </div>
            </div>
            <div className="budget-overview-bar">
              <div className="budget-bar-track" style={{ height: 10 }}>
                <div
                  className={`budget-bar-fill ${overallPct >= 100 ? "over" : overallPct >= 80 ? "warning" : "safe"}`}
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <span className="text-xs text-muted">{overallPct.toFixed(0)}% of total budget used</span>
            </div>
          </div>
        )}

        {showForm && (
          <div className="card" style={{ marginBottom: 20, maxWidth: 480 }}>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>Set Monthly Budget</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label htmlFor="bcat">Category</label>
                <select
                  id="bcat"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="blimit">Monthly Limit (₹)</label>
                <input
                  id="blimit"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Budget"}
              </button>
            </form>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No budgets set for {monthName}</h3>
            <p>Click "Set Budget" to start tracking your spending limits</p>
          </div>
        ) : (
          <div className="budget-cards-grid">
            {budgets.map((b) => {
              const pct    = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
              const status = pct >= 100 ? "over" : pct >= 80 ? "warning" : "safe";
              const remaining = b.limit - b.spent;

              return (
                <div className={`budget-card ${status}`} key={b._id}>
                  <div className="budget-card-header">
                    <span className="font-semibold">{b.category}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--text-muted)", padding: "2px 8px" }}
                      onClick={() => handleDelete(b._id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="budget-amounts">
                    <span className={`budget-spent ${status === "over" ? "over" : ""}`}>
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-muted text-sm">of {formatCurrency(b.limit)}</span>
                  </div>

                  <div className="budget-bar-wrap">
                    <div className="budget-bar-track">
                      <div className={`budget-bar-fill ${status}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="budget-card-footer">
                    <span className={`text-sm ${status === "over" ? "text-danger" : "text-muted"}`}>
                      {status === "over"
                        ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                        : `${formatCurrency(remaining)} remaining`}
                    </span>
                    <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
