import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currency: user?.currency || "INR",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (form.password && form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    const payload = { name: form.name, email: form.email, currency: form.currency };
    if (form.password) payload.password = form.password;

    try {
      const res = await updateProfile(payload);
      updateUser(res.data);
      setSuccess("Profile updated successfully");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="profile-layout">
          <div className="card profile-avatar-card">
            <div className="avatar-lg">{initials}</div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-currency-badge">
              Currency: {user?.currency || "INR"}
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h2 className="section-heading" style={{ marginBottom: 20 }}>Edit Profile</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select id="currency" name="currency" value={form.currency} onChange={handleChange}>
                  <option value="INR">₹ INR — Indian Rupee</option>
                  <option value="USD">$ USD — US Dollar</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="GBP">£ GBP — British Pound</option>
                </select>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
