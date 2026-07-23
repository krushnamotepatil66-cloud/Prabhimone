import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import "./LoginForm.css";

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call to send password reset email
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
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

        {!isSent ? (
          <>
            <h2>Forgot Password?</h2>
            <p className="description-text">
              Enter your email address below, and we'll send you a link to reset
              your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="e.g. aditya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-container">
            <FaCheckCircle className="success-icon" />
            <h2>Reset Link Sent</h2>
            <p className="success-text">
              We have sent a secure password reset link to:
              <br />
              <strong>{email}</strong>
            </p>
            <p className="success-note">
              Please check your email inbox and follow the instructions to reset your password.
            </p>
            <button
              onClick={() => {
                setIsSent(false);
                setEmail("");
              }}
              className="login-btn reset-back-btn"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login">
            <FaArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
