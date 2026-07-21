import { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <div className="logo">
          <h2>PrabhimOne</h2>
        </div>

        {/* Hamburger/Close Button for Mobile View */}
        <button 
          className="navbar-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Collapsible Menu Wrapper */}
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <nav>
            <ul className="nav-links">
              <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
              <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
              <li><a href="#customers" onClick={() => setMenuOpen(false)}>Customers</a></li>
              <li><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a></li>
            </ul>
          </nav>

          <div className="nav-buttons">
            <Link to="/login" className="nav-login-btn" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="nav-signup-btn" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;