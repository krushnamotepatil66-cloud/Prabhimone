import "./LoginForm.css";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple, FaArrowLeft } from "react-icons/fa";

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful login and navigate to dashboard
    navigate("/dashboard");
  };

  const handleSocialLogin = (platform) => {
    // Simulate social login and navigate to dashboard
    navigate("/dashboard");
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
        <h2>Welcome </h2>
        <p>Sign in to continue managing your business.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. aditya@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="At least 6 characters"
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

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="social-login-container">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={() => handleSocialLogin("Google")}
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-btn apple-btn"
            onClick={() => handleSocialLogin("Apple")}
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