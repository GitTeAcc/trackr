import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMonthlySummary, getTransactions, getBudgets } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    async function loadAll() {
      try {
        const [sumRes, txRes, budRes] = await Promise.all([
          getMonthlySummary({ month: now.getMonth() + 1, year: now.getFullYear() }),
          getTransactions({ limit: 5, page: 1 }),
          getBudgets({ month: now.getMonth() + 1, year: now.getFullYear() }),
        ]);
        setSummary(sumRes.data);
        setRecent(txRes.data.transactions);
        setBudgets(budRes.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content"><div className="spinner" /></main>
    </div>
  );

  const balance = summary?.balance || 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1>Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p>{monthName} overview</p>
        </div>

        <div className="dashboard-summary-grid">
          <div className="summary-card">
            <div className="summary-card-icon balance">💳</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Balance</div>
              <div className={`summary-card-value ${balance >= 0 ? "income" : "expense"}`}>
                {formatCurrency(balance)}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon income">📥</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Income</div>
              <div className="summary-card-value income">{formatCurrency(summary?.income)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon expense">📤</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Expenses</div>
              <div className="summary-card-value expense">{formatCurrency(summary?.expense)}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-bottom">
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h2 className="section-heading">Recent Transactions</h2>
              <Link to="/transactions" className="btn btn-ghost btn-sm">View all</Link>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No transactions yet</h3>
                <p>Add your first transaction to get started</p>
                <Link to="/add" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Add Transaction</Link>
              </div>
            ) : (
              <div className="tx-list">
                {recent.map((tx) => (
                  <div className="tx-row" key={tx._id}>
                    <div className="tx-category-dot" style={{ background: tx.type === "income" ? "var(--green-light)" : "var(--danger)" }} />
                    <div className="tx-info">
                      <div className="tx-desc">{tx.description || tx.category}</div>
                      <div className="tx-meta">{tx.category} · {formatDate(tx.date)}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h2 className="section-heading">Budget Overview</h2>
              <Link to="/budgets" className="btn btn-ghost btn-sm">Manage</Link>
            </div>

            {budgets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>No budgets set</h3>
                <p>Set monthly budgets to track your spending</p>
                <Link to="/budgets" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Set Budget</Link>
              </div>
            ) : (
              <div className="budget-list">
                {budgets.map((b) => {
                  const pct = Math.min((b.spent / b.limit) * 100, 100);
                  const status = pct >= 100 ? "over" : pct >= 80 ? "warning" : "safe";
                  return (
                    <div className="budget-item" key={b._id}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{ fontSize: "0.9rem" }}>{b.category}</span>
                        <span className="text-sm text-muted">
                          {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                        </span>
                      </div>
                      <div className="budget-bar-wrap">
                        <div className="budget-bar-track">
                          <div className={`budget-bar-fill ${status}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {summary?.byCategory?.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>Top Spending Categories</h2>
            <div className="top-categories">
              {summary.byCategory.slice(0, 5).map((cat) => (
                <div className="top-category-row" key={cat._id}>
                  <span className="font-medium">{cat._id}</span>
                  <div className="flex items-center gap-12">
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${Math.min((cat.total / summary.expense) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm" style={{ minWidth: 80, textAlign: "right" }}>
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
