import { useState } from "react";
import "./SignupForm.css";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple } from "react-icons/fa";

function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to OTP verification page with email state
    navigate("/verify", { state: { email } });
  };

  const handleSocialSignup = (platform) => {
    // Redirect to OTP verification page
    navigate("/verify", { state: { email: `${platform.toLowerCase()}user@example.com` } });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>PrabhimOne</h1>
        <h2>Create Account</h2>
        <p>Start managing your invoices in minutes.</p>

        <form onSubmit={handleSubmit}>
          <div className="signup-grid">
            <div className="input-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="e.g. Aditya Kumar"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-business">Business Name</label>
              <input
                id="signup-business"
                type="text"
                placeholder="e.g. Acme Corporation"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="e.g. aditya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="At least 6  characters"
                required
              />
            </div>
          </div>

          <div className="signup-terms">
            <label htmlFor="agree-terms" className="checkbox-label">
              <input id="agree-terms" type="checkbox" required />
              <span>
                I agree to the PrabhimOne{" "}
                <a href="#terms" className="terms-link">
                  Terms and Conditions of Service
                </a>{" "}
                and{" "}
                <a href="#privacy" className="terms-link">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="social-signup-container">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={() => handleSocialSignup("Google")}
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-btn apple-btn"
            onClick={() => handleSocialSignup("Apple")}
          >
            <FaApple />
            <span>Apple</span>
          </button>
        </div>

        <p className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;