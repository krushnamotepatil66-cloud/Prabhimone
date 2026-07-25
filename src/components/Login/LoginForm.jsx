import "./LoginForm.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaArrowLeft } from "react-icons/fa";
import { authApi } from "../../api/client";

import { isRequiredEmailValid } from "../../utils/validation";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isRequiredEmailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setError("Cannot connect to server. Please check your internet or contact your backend developer.");
      } else {
        setError(err.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    setError("Social login is not available yet.");
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ position: "relative" }}>
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
        <h2>Welcome</h2>
        <p>Sign in to continue managing your business.</p>

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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. aditya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label htmlFor="remember-me">
              <input id="remember-me" type="checkbox" />
              Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="social-login-container">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={handleSocialLogin}
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-btn apple-btn"
            onClick={handleSocialLogin}
          >
            <FaApple />
            <span>Apple</span>
          </button>
        </div>

        <p className="signup-link">
          Don't have an account?
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;