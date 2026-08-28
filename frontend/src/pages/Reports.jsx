import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getMonthlySummary, getSpendingTrend } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import "../styles/reports.css";

function formatCurrency(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 });
}

const PIE_COLORS = ["#2d6a4f","#40916c","#52b788","#95d5b2","#457b9d","#e9c46a","#e76f51","#6d6875","#264653","#c0392b"];

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [sumRes, trendRes] = await Promise.all([
          getMonthlySummary({ month: selectedMonth, year: selectedYear }),
          getSpendingTrend({ months: 6 }),
        ]);
        setSummary(sumRes.data);
        setTrend(trendRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [selectedMonth, selectedYear]);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const pieData = summary?.byCategory?.map((c) => ({ name: c._id, value: c.total })) || [];

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content"><div className="spinner" /></main>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Reports</h1>
            <p>Visual breakdown of your finances</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem" }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m} {selectedYear}</option>
            ))}
          </select>
        </div>

        <div className="reports-summary-row">
          <div className="reports-stat-card income">
            <div className="reports-stat-label">Income</div>
            <div className="reports-stat-value">{formatCurrency(summary?.income)}</div>
          </div>
          <div className="reports-stat-card expense">
            <div className="reports-stat-label">Expenses</div>
            <div className="reports-stat-value">{formatCurrency(summary?.expense)}</div>
          </div>
          <div className="reports-stat-card balance">
            <div className="reports-stat-label">Net Balance</div>
            <div className={`reports-stat-value ${(summary?.balance || 0) >= 0 ? "positive" : "negative"}`}>
              {formatCurrency(summary?.balance)}
            </div>
          </div>
          <div className="reports-stat-card neutral">
            <div className="reports-stat-label">Transactions</div>
            <div className="reports-stat-value">{(summary?.incomeCount || 0) + (summary?.expenseCount || 0)}</div>
          </div>
        </div>

        <div className="reports-charts-row">
          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: 20 }}>
              Spending by Category — {months[selectedMonth - 1]}
            </h2>
            {pieData.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon">📊</div>
                <p>No expense data for this month</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-legend">
                  {pieData.map((item, i) => (
                    <div className="pie-legend-item" key={item.name}>
                      <span className="pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="pie-label">{item.name}</span>
                      <span className="pie-value">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: 20 }}>6-Month Trend</h2>
            {trend.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon">📈</div>
                <p>Not enough data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trend} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="income"  name="Income"  fill="var(--green-light)" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="Expense" fill="var(--danger)"      radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
