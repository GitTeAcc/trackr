import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { getTransactions, deleteTransaction, getCategories } from "../services/api";
import "../styles/transactions.css";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getTransactions(params);
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  }

  function clearFilters() {
    setFilters({ type: "", category: "", startDate: "", endDate: "" });
    setPage(1);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1>Transactions</h1>
          <p>Your complete transaction history</p>
        </div>

        <div className="card filters-bar">
          <div className="filters-row">
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="From"
            />

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="To"
            />

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="spinner" />
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No transactions found</h3>
              <p>{hasActiveFilters ? "Try adjusting your filters" : "Add your first transaction to get started"}</p>
            </div>
          ) : (
            <>
              <div className="tx-table-header">
                <span>Description</span>
                <span>Category</span>
                <span>Date</span>
                <span>Amount</span>
                <span></span>
              </div>
              <div className="tx-table-body">
                {transactions.map((tx) => (
                  <div className="tx-table-row" key={tx._id}>
                    <div className="tx-desc-cell">
                      <div className="tx-type-dot" style={{ background: tx.type === "income" ? "var(--green-light)" : "var(--danger)" }} />
                      <span>{tx.description || "—"}</span>
                    </div>
                    <span className="text-muted text-sm">{tx.category}</span>
                    <span className="text-muted text-sm">{formatDate(tx.date)}</span>
                    <span className={`tx-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                    <div className="tx-row-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(tx._id)}
                        disabled={deletingId === tx._id}
                      >
                        {deletingId === tx._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="text-muted text-sm">Page {page} of {totalPages}</span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
