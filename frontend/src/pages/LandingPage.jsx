import { useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lp-page">

      {/* Navbar */}
      <nav className="lp-navbar">
        <div className="lp-nav-inner">

          <Link to="/" className="lp-logo" onClick={closeMenu}>
            <span className="lp-logo-mark">L</span>
            <span>LEXORA</span>
          </Link>

          <button
            className="lp-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>

            <div className="lp-nav-actions">
              <Link
                to="/login"
                className="lp-login-link"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="lp-register-button"
                onClick={closeMenu}
              >
                Register
              </Link>
            </div>
          </div>

        </div>
      </nav>


      {/* Hero */}
      <section id="home" className="lp-hero">
        <div className="lp-hero-content">

          <div className="lp-eyebrow">
            AI-POWERED LEGAL INTELLIGENCE
          </div>

          <h1>
            Smarter Legal
            <br />
            Analysis with AI
          </h1>

          <p>
            Analyze legal documents faster, identify important clauses,
            detect potential risks, and ask questions using AI-powered
            document intelligence.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-primary-button">
              Get Started
            </Link>

            <Link to="/login" className="lp-secondary-button">
              Login
            </Link>
          </div>

          <div className="lp-disclaimer">
            AI-generated analysis is for informational purposes only and
            does not constitute legal advice.
          </div>

        </div>
      </section>


      {/* Technology / Trust Strip */}
      <section className="lp-tech-strip">
        <p>Built with modern technologies</p>

        <div className="lp-tech-list">
          <span>React</span>
          <span>FastAPI</span>
          <span>RAG</span>
          <span>PostgreSQL</span>
          <span>AI</span>
        </div>
      </section>


      {/* Features */}
      <section id="features" className="lp-section">

        <div className="lp-section-header">
          <span className="lp-section-label">FEATURES</span>

          <h2>
            Everything you need for
            <br />
            smarter document review
          </h2>

          <p>
            Powerful AI features designed to make legal document analysis
            faster, clearer, and easier.
          </p>
        </div>


        <div className="lp-feature-list">

          <div className="lp-feature-card">
            <div className="lp-feature-number">01</div>

            <div>
              <h3>📄 AI Document Analysis</h3>
              <p>
                Analyze contracts and generate clear, structured summaries
                using AI.
              </p>
            </div>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-number">02</div>

            <div>
              <h3>⚠️ Risk Detection</h3>
              <p>
                Identify potentially important or risky clauses quickly
                during document review.
              </p>
            </div>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-number">03</div>

            <div>
              <h3>📅 Important Dates</h3>
              <p>
                Find deadlines, renewal dates, termination windows,
                and other important dates.
              </p>
            </div>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-number">04</div>

            <div>
              <h3>💬 Ask AI</h3>
              <p>
                Ask questions about your uploaded document and receive
                AI-generated answers.
              </p>
            </div>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-number">05</div>

            <div>
              <h3>📑 Key Clauses</h3>
              <p>
                Quickly identify important clauses and obligations
                inside legal documents.
              </p>
            </div>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-number">06</div>

            <div>
              <h3>📥 Legal Report</h3>
              <p>
                Generate a structured analysis report that can be
                reviewed and downloaded.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* How It Works */}
      <section id="how-it-works" className="lp-section lp-section-alt">

        <div className="lp-section-header">
          <span className="lp-section-label">HOW IT WORKS</span>

          <h2>
            From document to
            <br />
            useful insights
          </h2>

          <p>
            A simple workflow designed to help you understand your
            legal documents faster.
          </p>
        </div>


        <div className="lp-steps">

          <div className="lp-step-card">
            <div className="lp-step-number">01</div>

            <div>
              <h3>Upload Document</h3>
              <p>
                Upload your legal document securely and start the
                analysis process.
              </p>
            </div>
          </div>


          <div className="lp-step-card">
            <div className="lp-step-number">02</div>

            <div>
              <h3>AI Processing</h3>
              <p>
                The system processes the document and prepares its
                content for AI-powered analysis.
              </p>
            </div>
          </div>


          <div className="lp-step-card">
            <div className="lp-step-number">03</div>

            <div>
              <h3>Review Analysis</h3>
              <p>
                Review summaries, risks, important clauses,
                and other document insights.
              </p>
            </div>
          </div>


          <div className="lp-step-card">
            <div className="lp-step-number">04</div>

            <div>
              <h3>Ask AI / Download Report</h3>
              <p>
                Ask questions about the document or generate a
                structured analysis report.
              </p>
            </div>
          </div>

        </div>

      </section>


      {/* Why Choose Us */}
      <section className="lp-section">

        <div className="lp-section-header">
          <span className="lp-section-label">WHY CHOOSE US</span>

          <h2>
            Built for faster
            <br />
            legal document review
          </h2>
        </div>


        <div className="lp-why-grid">

          <div className="lp-why-card">
            <div className="lp-why-icon">⚡</div>

            <h3>Faster Review</h3>

            <p>
              Reduce the time spent manually reviewing long
              and complex documents.
            </p>
          </div>


          <div className="lp-why-card">
            <div className="lp-why-icon">✦</div>

            <h3>AI-Powered Insights</h3>

            <p>
              Use AI to surface useful information from your
              uploaded legal documents.
            </p>
          </div>


          <div className="lp-why-card">
            <div className="lp-why-icon">⌕</div>

            <h3>Citation Support</h3>

            <p>
              Review answers together with relevant document
              references and citations.
            </p>
          </div>

        </div>

      </section>


      {/* Security & Privacy */}
      <section className="lp-section lp-security">

        <div className="lp-section-header">
          <span className="lp-section-label">SECURITY & PRIVACY</span>

          <h2>
            Designed with security
            <br />
            and privacy in mind
          </h2>

          <p>
            Designed with secure document handling and protected access
            in mind throughout the analysis workflow.
          </p>
        </div>


        <div className="lp-security-grid">

          <div className="lp-security-card">
            <div className="lp-security-icon">🔐</div>

            <h3>Protected Access</h3>

            <p>
              User accounts and protected routes help keep document
              access limited to authorized users.
            </p>
          </div>


          <div className="lp-security-card">
            <div className="lp-security-icon">📄</div>

            <h3>Document Privacy</h3>

            <p>
              Documents are handled through the application's
              authenticated document workflow.
            </p>
          </div>


          <div className="lp-security-card">
            <div className="lp-security-icon">🛡️</div>

            <h3>Secure AI Workflow</h3>

            <p>
              Document processing, analysis, and AI interaction are
              connected through protected application APIs.
            </p>
          </div>

        </div>

      </section>


      {/* FAQ */}
      <section id="faq" className="lp-section lp-faq">

        <div className="lp-section-header">
          <span className="lp-section-label">FAQ</span>

          <h2>
            Frequently asked
            <br />
            questions
          </h2>

          <p>
            Quick answers about the AI Legal Document Analyzer.
          </p>
        </div>


        <div className="lp-faq-list">

          <details className="lp-faq-item">
            <summary>
              What types of documents can I analyze?
            </summary>

            <p>
              You can upload supported PDF legal documents and use
              AI-powered analysis, document questions, and citations.
            </p>
          </details>


          <details className="lp-faq-item">
            <summary>
              Can I ask questions about my document?
            </summary>

            <p>
              Yes. After the document is processed, you can ask questions
              about its content through the AI chat interface.
            </p>
          </details>


          <details className="lp-faq-item">
            <summary>
              Does the system provide legal advice?
            </summary>

            <p>
              No. The AI-generated analysis is intended for informational
              purposes only and should not be considered legal advice.
            </p>
          </details>


          <details className="lp-faq-item">
            <summary>
              Can I see where an answer comes from?
            </summary>

            <p>
              The application supports citations that help you review the
              relevant source content behind AI-generated answers.
            </p>
          </details>


          <details className="lp-faq-item">
            <summary>
              Can I download the analysis?
            </summary>

            <p>
              Yes. The application supports generating a structured
              analysis report for the processed document.
            </p>
          </details>

        </div>

      </section>


      {/* Project Highlights */}
      <section className="lp-section lp-highlights">

        <div className="lp-highlight-grid">

          <div className="lp-highlight-item">
            <strong>AI</strong>
            <span>Powered Analysis</span>
          </div>


          <div className="lp-highlight-item">
            <strong>RAG</strong>
            <span>Document Intelligence</span>
          </div>


          <div className="lp-highlight-item">
            <strong>PDF</strong>
            <span>Document Support</span>
          </div>


          <div className="lp-highlight-item">
            <strong>JWT</strong>
            <span>Secure Authentication</span>
          </div>

        </div>

      </section>


      {/* About */}
      <section id="about" className="lp-section lp-section-alt">

        <div className="lp-about">

          <div>
            <span className="lp-section-label">ABOUT</span>

            <h2>
              Making legal documents
              <br />
              easier to understand
            </h2>
          </div>

          <div>
            <p>
              AI Legal Document Analyzer is designed to help users
              quickly understand important information within legal
              documents.
            </p>

            <p>
              Instead of manually searching through lengthy contracts,
              users can upload a document, review AI-generated insights,
              ask questions, and explore relevant citations.
            </p>
          </div>

        </div>

      </section>


      {/* User Experience */}
      <section className="lp-section">

        <div className="lp-section-header">
          <span className="lp-section-label">USER EXPERIENCE</span>

          <h2>
            Designed to keep
            <br />
            document review simple
          </h2>
        </div>


        <div className="lp-review-grid">

          <div className="lp-review-card">
            <div className="lp-review-stars">★★★★★</div>

            <p>
              “The interface makes it easy to upload a document
              and quickly understand the important sections.”
            </p>

            <strong>Simple workflow</strong>
          </div>


          <div className="lp-review-card">
            <div className="lp-review-stars">★★★★★</div>

            <p>
              “Being able to ask questions directly about the
              uploaded document makes review much easier.”
            </p>

            <strong>AI-powered interaction</strong>
          </div>


          <div className="lp-review-card">
            <div className="lp-review-stars">★★★★★</div>

            <p>
              “Citations make it easier to understand where
              information in an answer comes from.”
            </p>

            <strong>Source-aware answers</strong>
          </div>

        </div>

      </section>


      {/* Final CTA */}
      <section className="lp-cta">

        <div>
          <span className="lp-section-label">GET STARTED</span>

          <h2>
            Ready to analyze your
            <br />
            legal documents smarter?
          </h2>

          <p>
            Upload your first document and explore AI-powered
            legal document analysis.
          </p>

          <Link to="/register" className="lp-primary-button">
            Get Started
          </Link>
        </div>

      </section>


      {/* Contact / Footer */}
      <footer id="contact" className="lp-footer">

        <div className="lp-footer-main">

          {/* Brand */}
          <div className="lp-footer-brand">

            <Link to="/" className="lp-logo">
              <span className="lp-logo-mark">L</span>
              <span>LEXORA</span>
            </Link>

            <p>
              AI-powered legal document intelligence for faster
              and clearer document review.
            </p>

          </div>


          {/* Product */}
          <div className="lp-footer-column">

            <h4>Product</h4>

            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>

          </div>


          {/* Contact */}
          <div className="lp-footer-column">

            <h4>Contact</h4>

            <a href="mailto:maniprabhashankar@gmail.com">
              maniprabhashankar@gmail.com
            </a>

          </div>

        </div>


        <div className="lp-footer-bottom">

          <span>
            © 2026 LEXORA
          </span>

          <span>
            AI-generated analysis is not legal advice.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default LandingPage;