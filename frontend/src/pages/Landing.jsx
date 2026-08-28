import { Link } from "react-router-dom";
import "../styles/landing.css";

const features = [
  { icon: "📊", title: "Smart Dashboard", desc: "See your income, expenses, and balance at a glance every month." },
  { icon: "🏷️", title: "Categories", desc: "Organize spending into custom categories with colors and icons." },
  { icon: "🎯", title: "Budget Tracking", desc: "Set monthly budgets per category and track how close you are." },
  { icon: "📈", title: "Visual Reports", desc: "Pie charts and trend graphs to understand spending patterns." },
  { icon: "🏠", title: "Household Mode", desc: "Invite family members and see your combined finances together." },
  { icon: "🔒", title: "Secure", desc: "Your data is yours. Password hashed, JWT-protected accounts." },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container flex items-center justify-between" style={{ height: "100%" }}>
          <div className="landing-brand">Trackr</div>
          <div className="flex gap-12">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="container">
          <h1 className="hero-title">
            Take control of<br />
            <span className="hero-highlight">your money</span>
          </h1>
          <p className="hero-subtitle">
            Track income, expenses, set budgets, and share finances with your household —
            all in one clean, modern app.
          </p>
          <div className="flex gap-16" style={{ justifyContent: "center" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="container">
          <h2 className="section-title">Everything you need</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
