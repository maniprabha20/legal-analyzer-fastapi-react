function AppFooter() {
  return (
    <footer className="app-footer">

      <div className="app-footer-main">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">L</span>
            <span>LEXORA</span>
          </div>

          <p className="footer-tagline">
            AI-powered legal intelligence for smarter document analysis.
          </p>
        </div>

        {/* Services */}
        <div className="footer-column">
          <h6>SERVICES</h6>
          <a href="#services">AI Document Analysis</a>
          <a href="#services">Risk Detection</a>
          <a href="#services">Ask AI</a>
          <a href="#services">Legal Reports</a>
        </div>

        {/* Popular Tools */}
        <div className="footer-column">
          <h6>POPULAR TOOLS</h6>
          <a href="#features">Contract Analysis</a>
          <a href="#features">Risk Review</a>
          <a href="#features">Clause Detection</a>
          <a href="#features">Document Q&amp;A</a>
        </div>

        {/* Resources */}
        <div className="footer-column">
          <h6>RESOURCES</h6>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQs</a>
          <a href="#about">About LEXORA</a>
        </div>

        {/* Help */}
        <div className="footer-column">
          <h6>HELP</h6>
          <a href="#contact">Contact Us</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="app-footer-bottom">

        <div className="footer-bottom-brand">
          <div className="footer-logo footer-logo-small">
            <span className="footer-logo-mark">L</span>
            <span>LEXORA</span>
          </div>

          <div className="footer-socials">
            <a href="https://github.com/maniprabha20/legal-analyzer-fastapi-react.git">
              GH
            </a>

            <a href="#contact">
              @
            </a>

            <a href="#about">
              in
            </a>
          </div>
        </div>

        <div className="footer-divider"></div>

        <p className="footer-disclaimer">
          LEXORA provides AI-powered document analysis and information
          intended for general informational purposes only. AI-generated
          analysis is not legal advice and should not replace advice from
          a qualified legal professional.
        </p>

        <div className="footer-links">
          <a href="#about">About Us</a>
          <a href="#terms">Terms of Use</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#contact">Contact Us</a>
        </div>

        <p className="footer-copyright">
          © 2026 LEXORA. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}

export default AppFooter;