import beaker from '../assets/images/blue-beaker-image.png';

interface HomeProps {
  onNavigate: (page: "home" | "login" | "register") => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#c9d7e0" }}>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#2c5282" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2">
            <img src={beaker} alt="Beaker Icon" style={{ width: 50, height: 40 }} />
            <span className="navbar-brand text-white mb-0 bold-text" >LabSpec Dashboard</span>
          </div>
          <div className="d-flex gap-3">
            <button onClick={() => onNavigate("login")} className="btn btn-outline-light">
              Login
            </button>
            <button onClick={() => onNavigate("register")} className="btn btn-light" style={{ color: "#2c5282" }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: "#2c5282" }}>
            Professional Specimen Tracking for Microbiologists
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: "#1a3a5c" }}>
            Streamline your laboratory workflow with our comprehensive specimen management system. 
            Track, analyze, and manage samples with confidence and precision.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate("register")} className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition text-lg font-semibold" style={{ backgroundColor: "#2c5282" }}>
              Start Free Trial
            </button>
            <button onClick={() => onNavigate("login")} className="px-8 py-3 rounded-lg border-2 hover:bg-white/20 transition text-lg font-semibold" style={{ borderColor: "#2c5282", color: "#2c5282" }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#2c5282" }}>
            Why Choose LabSpec?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Specimen Management", emoji: "🧪", desc: "Efficiently track and organize all your laboratory specimens in one centralized system." },
              { title: "Real-time Analytics", emoji: "📊", desc: "Monitor lab performance with comprehensive dashboards and detailed reports." },
              { title: "Secure & Compliant", emoji: "🛡️", desc: "HIPAA compliant with enterprise-grade security to protect sensitive laboratory data." },
              { title: "Workflow Automation", emoji: "⚙️", desc: "Automate routine tasks and reduce manual data entry to save valuable time." },
              { title: "Quality Control", emoji: "✅", desc: "Maintain high standards with built-in quality control checks and validation." },
              { title: "Lab Integration", emoji: "🔬", desc: "Seamlessly integrate with existing laboratory equipment and information systems." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border-none flex flex-col items-center text-center">
                <div className="text-4xl mb-4 p-3 rounded-lg" style={{ backgroundColor: "#f0f4f8" }}>
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#2c5282" }}>{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#2c5282" }}>
            Ready to Transform Your Laboratory?
          </h2>
          <p className="text-lg mb-8" style={{ color: "#1a3a5c" }}>
            Join hundreds of microbiologists who trust LabSpec for their specimen management needs.
          </p>
          <button
            onClick={() => onNavigate("register")}
            className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition text-lg inline-block font-semibold"
            style={{ backgroundColor: "#2c5282" }}
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: "#2c5282" }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/80">© 2026 LabSpec Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}