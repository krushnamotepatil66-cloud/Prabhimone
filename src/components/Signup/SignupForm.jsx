import { useState } from "react";
import "./SignupForm.css";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaArrowLeft } from "react-icons/fa";
import { authApi } from "../../api/client";

import { isRequiredEmailValid, isValidMobile, sanitizeMobileInput } from "../../utils/validation";

function SignupForm() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91-");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isRequiredEmailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone && !isValidMobile(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        password_confirm: confirmPassword,
      });
      // On success, navigate to OTP verification
      navigate("/verify", { state: { email } });
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setError("Cannot connect to server. Please contact your backend developer to start the server.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = () => {
    setError("Social signup is not available yet.");
  };

  return (
    <div className="signup-container">
      <div className="signup-card" style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          title="Go Back"
          aria-label="Go back"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "#f1f5f9",
            border: "none",
            fontSize: "16px",
            color: "#475569",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            transition: "all 0.2s"
          }}
        >
          <FaArrowLeft />
        </button>
        <h1>PrabhimOne</h1>
        <h2>Create Account</h2>
        <p>Start managing your invoices in minutes.</p>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
            lineHeight: "1.5"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="signup-grid">
            <div className="input-group">
              <label htmlFor="signup-firstname">First Name</label>
              <input
                id="signup-firstname"
                type="text"
                placeholder="e.g. Aditya"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-lastname">Last Name</label>
              <input
                id="signup-lastname"
                type="text"
                placeholder="e.g. Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="off"
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
                autoComplete="off"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="ex. +91-9876543210"
                value={phone}
                onChange={(e) => setPhone(sanitizeMobileInput(e.target.value))}
                autoComplete="off"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="social-signup-container">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={handleSocialSignup}
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-btn apple-btn"
            onClick={handleSocialSignup}
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