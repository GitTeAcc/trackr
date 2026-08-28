import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getMyHousehold, createHousehold, joinHousehold, leaveHousehold } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/household.css";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Household() {
  const { user, updateUser } = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode]           = useState("");

  useEffect(() => {
    if (user?.householdId) {
      getMyHousehold()
        .then((res) => setData(res.data))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!createName.trim()) return setError("Please enter a household name");
    setSubmitting(true);
    try {
      await createHousehold({ name: createName });
      const res = await getMyHousehold();
      setData(res.data);
      updateUser({ householdId: res.data.household._id });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create household");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return setError("Please enter an invite code");
    setSubmitting(true);
    try {
      await joinHousehold({ inviteCode: joinCode.trim().toUpperCase() });
      const res = await getMyHousehold();
      setData(res.data);
      updateUser({ householdId: res.data.household._id });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid invite code");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this household?")) return;
    try {
      await leaveHousehold();
      setData(null);
      updateUser({ householdId: null });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave");
    }
  }

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content"><div className="spinner" /></main>
    </div>
  );

  if (!data) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="page-content">
          <div className="page-header">
            <h1>Household</h1>
            <p>Share finances with your family or housemates</p>
          </div>

          <div className="household-onboard">
            <div className="household-onboard-icon">🏠</div>
            <h2>You're not in a household yet</h2>
            <p>Create a new household or join one with an invite code.</p>

            <div className="household-onboard-actions">
              <button
                className={`btn ${mode === "create" ? "btn-primary" : "btn-outline"}`}
                onClick={() => { setMode("create"); setError(""); }}
              >
                Create Household
              </button>
              <button
                className={`btn ${mode === "join" ? "btn-primary" : "btn-outline"}`}
                onClick={() => { setMode("join"); setError(""); }}
              >
                Join with Code
              </button>
            </div>

            {error && <div className="alert alert-error" style={{ maxWidth: 400, margin: "0 auto" }}>{error}</div>}

            {mode === "create" && (
              <form onSubmit={handleCreate} className="household-form">
                <div className="form-group">
                  <label htmlFor="hname">Household Name</label>
                  <input
                    id="hname"
                    type="text"
                    placeholder="e.g. Smith Family, Flat 4B"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Household"}
                </button>
              </form>
            )}

            {mode === "join" && (
              <form onSubmit={handleJoin} className="household-form">
                <div className="form-group">
                  <label htmlFor="code">Invite Code</label>
                  <input
                    id="code"
                    type="text"
                    placeholder="e.g. GF29AX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ textTransform: "uppercase", letterSpacing: "0.3em", fontWeight: 600 }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? "Joining..." : "Join Household"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  const { household, members, totals } = data;
  const isOwner = household.ownerId === user?._id || household.ownerId?.toString() === user?._id?.toString();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>🏠 {household.name}</h1>
            <p>{members.length} member{members.length !== 1 ? "s" : ""} · This month's combined view</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLeave} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            {isOwner ? "Dissolve Household" : "Leave Household"}
          </button>
        </div>

        <div className="invite-code-card">
          <div>
            <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Invite Code — share this with others to let them join</div>
            <div className="invite-code">{household.inviteCode}</div>
          </div>
        </div>

        <div className="household-totals-grid">
          <div className="summary-card">
            <div className="summary-card-icon income">📥</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Combined Income</div>
              <div className="summary-card-value income">{formatCurrency(totals.income)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon expense">📤</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Combined Expenses</div>
              <div className="summary-card-value expense">{formatCurrency(totals.expense)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon balance">💳</div>
            <div className="summary-card-body">
              <div className="summary-card-label">Combined Balance</div>
              <div className={`summary-card-value ${totals.balance >= 0 ? "income" : "expense"}`}>
                {formatCurrency(totals.balance)}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>Member Breakdown — This Month</h2>
          <div className="member-table">
            <div className="member-table-header">
              <span>Member</span>
              <span>Income</span>
              <span>Expenses</span>
              <span>Balance</span>
            </div>
            {members.map((m) => {
              const initials = m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div className="member-table-row" key={m._id}>
                  <div className="member-info">
                    <div className="avatar-sm">{initials}</div>
                    <div>
                      <div className="font-medium" style={{ fontSize: "0.9rem" }}>{m.name}</div>
                      <div className="text-xs text-muted">{m.email}</div>
                    </div>
                  </div>
                  <span className="member-stat income">{formatCurrency(m.income)}</span>
                  <span className="member-stat expense">{formatCurrency(m.expense)}</span>
                  <span className={`member-stat ${m.balance >= 0 ? "income" : "expense"}`}>
                    {formatCurrency(m.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
