import beaker from '../assets/images/blue-beaker-image.png';

interface HomeProps {
  onNavigate: (page: "home" | "login" | "register") => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#c9d7e0" }}>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#2c5282" }}>
        <div className="container">
          <div className="d-flex align-items-center gap-2">
            <img src={beaker} alt="Beaker Icon" style={{ width: 45 }} />
            <span className="navbar-brand text-white mb-0 fw-bold">
              LabSpec Dashboard
            </span>
          </div>

          <div className="d-flex gap-3">
            <button onClick={() => onNavigate("login")} className="btn btn-outline-light">
              Login
            </button>
            <button
              onClick={() => onNavigate("register")}
              className="btn btn-light fw-semibold"
              style={{ color: "#2c5282" }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="py-5 text-center">
        <div className="container">
          <h1 className="fw-bold mb-4" style={{ color: "#2c5282", fontSize: "2.8rem" }}>
            Professional Specimen Tracking for Microbiologists
          </h1>

          <p className="lead mb-4" style={{ color: "#1a3a5c", maxWidth: 700, margin: "0 auto" }}>
            Streamline your laboratory workflow with our comprehensive specimen management system.
            Track, analyze, and manage samples with confidence and precision.
          </p>

          <div className="d-flex justify-content-center gap-3">
            <button
              onClick={() => onNavigate("register")}
              className="btn px-4 py-2 text-white fw-semibold"
              style={{ backgroundColor: "#2c5282" }}
            >
              Start Free Trial
            </button>

            <button
              onClick={() => onNavigate("login")}
              className="btn px-4 py-2 fw-semibold"
              style={{ border: "2px solid #2c5282", color: "#2c5282" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#2c5282" }}>
            Why Choose LabSpec?
          </h2>

          <div className="row g-4">
            {[
              { title: "Specimen Management", emoji: "🧪", desc: "Track and organize specimens in one system." },
              { title: "Real-time Analytics", emoji: "📊", desc: "Monitor performance with dashboards and reports." },
              { title: "Secure & Compliant", emoji: "🛡️", desc: "Enterprise-grade security and HIPAA compliance." },
              { title: "Workflow Automation", emoji: "⚙️", desc: "Automate routine lab processes." },
              { title: "Quality Control", emoji: "✅", desc: "Built-in validation and quality checks." },
              { title: "Lab Integration", emoji: "🔬", desc: "Integrates with existing lab systems." }
            ].map((feature, idx) => (
              <div key={idx} className="col-md-4">
                <div
                  className="bg-white rounded-4 shadow d-flex flex-column align-items-center justify-content-center text-center p-3"
                  style={{
                    height: "250px",   // 👈 FORCE SQUARE SHAPE
                    width: "100%",
                  }}
                >
                  <div className="mb-3 fs-2">{feature.emoji}</div>

                  <h5 className="fw-bold" style={{ color: "#2c5282" }}>
                    {feature.title}
                  </h5>

                  <p className="text-muted small mb-0">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5">
        <div className="container">
          <div className="bg-white rounded-4 shadow text-center p-5">
            <h3 className="fw-bold mb-3" style={{ color: "#2c5282" }}>
              Ready to Transform Your Laboratory?
            </h3>

            <p className="mb-4 text-muted">
              Join microbiologists who trust LabSpec for specimen management.
            </p>

            <button
              onClick={() => onNavigate("register")}
              className="btn text-white px-4 py-2 fw-semibold"
              style={{ backgroundColor: "#2c5282" }}
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-3 text-center" style={{ backgroundColor: "#2c5282" }}>
        <p className="text-white mb-0">© 2026 LabSpec Dashboard</p>
      </footer>
    </div>
  );
}