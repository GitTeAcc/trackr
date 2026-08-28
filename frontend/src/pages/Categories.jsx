import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getCategories, createCategory, deleteCategory } from "../services/api";
import "../styles/categories.css";

const colorOptions = ["#2d6a4f","#40916c","#52b788","#457b9d","#e76f51","#e9c46a","#6d6875","#264653","#c0392b","#d97706"];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "📁", color: "#2d6a4f", type: "expense" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");
    setLoading(true);
    try {
      const res = await createCategory(form);
      setCategories((prev) => [...prev, res.data]);
      setForm({ name: "", icon: "📁", color: "#2d6a4f", type: "expense" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  }

  const userCats   = categories.filter((c) => c.userId);
  const systemCats = categories.filter((c) => !c.userId);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Categories</h1>
            <p>Manage how you label your transactions</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Category"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>New Category</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="category-form">
              <div className="form-group">
                <label htmlFor="cat-name">Name</label>
                <input
                  id="cat-name"
                  type="text"
                  placeholder="e.g. Gym, Subscriptions"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="cat-icon">Icon (emoji)</label>
                  <input
                    id="cat-icon"
                    type="text"
                    maxLength={2}
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    style={{ fontSize: "1.4rem", textAlign: "center" }}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot ${form.color === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
        )}

        {userCats.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>Your Categories</h2>
            <div className="categories-grid">
              {userCats.map((cat) => (
                <div className="category-chip" key={cat._id}>
                  <div className="category-chip-icon" style={{ background: cat.color + "22", color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="category-chip-info">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-muted" style={{ textTransform: "capitalize" }}>{cat.type}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat._id)} style={{ color: "var(--danger)" }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="section-heading" style={{ marginBottom: 16 }}>Default Categories</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            These are provided by default and cannot be deleted.
          </p>
          <div className="categories-grid">
            {systemCats.map((cat) => (
              <div className="category-chip readonly" key={cat._id}>
                <div className="category-chip-icon" style={{ background: cat.color + "22", color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="category-chip-info">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-muted" style={{ textTransform: "capitalize" }}>{cat.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
