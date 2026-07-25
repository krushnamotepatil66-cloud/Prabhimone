import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import "../Login/LoginForm.css";
import { authApi } from "../../api/client";

function VerifyOTPForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve passed email or fallback
  const email = location.state?.email || "your email address";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  const [emailCooldown, setEmailCooldown] = useState(30);
  const [emailMsg, setEmailMsg] = useState("");

  // Countdown for Resend timer
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => {
        setEmailCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  const handleResendEmail = async () => {
    if (emailCooldown > 0) return;
    setEmailCooldown(30);
    try {
      await authApi.resendOtp(email, "registration");
      setEmailMsg("A fresh code has been sent to your email!");
    } catch (err) {
      setEmailMsg("Failed to resend. Please try again.");
    }
    setTimeout(() => setEmailMsg(""), 3500);
  };

  const handleChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Focus previous field if current is empty
        const prevInput = document.getElementById(`otp-digit-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        // Clear current value
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").substring(0, 6);
    if (!text) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (text[i] !== undefined) {
        newOtp[i] = text[i];
      }
    }
    setOtp(newOtp);

    // Focus target input
    const targetIdx = Math.min(text.length - 1, 5);
    const targetInput = document.getElementById(`otp-digit-${targetIdx}`);
    if (targetInput) targetInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;

    setIsVerifying(true);
    setError("");
    try {
      await authApi.verifyEmail({ email, otp: enteredOtp });
      setIsVerified(true);
      // Auto redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

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

        {!isVerified ? (
          <>
            <h2>Verify Your Account</h2>
            <p className="description-text">
              We've sent a 6-digit verification code (OTP) to:
              <br />
              <strong style={{ color: "#1e293b", wordBreak: "break-all" }}>{email}</strong>
            </p>

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "12px",
                lineHeight: "1.5"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email OTP Field */}
              <div className="input-group">
                <div className="otp-label-row">
                  <label htmlFor="otp-digit-0">
                    <FaEnvelope style={{ marginRight: "6px", fontSize: "12px", color: "#6366f1" }} />
                    Email OTP
                  </label>
                  <button
                    type="button"
                    className="otp-resend-link"
                    onClick={handleResendEmail}
                    disabled={emailCooldown > 0}
                  >
                    {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend Code"}
                  </button>
                </div>

                <div className="otp-digit-container" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-digit-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="otp-digit-input"
                      required
                    />
                  ))}
                </div>

                {emailMsg && <span className="otp-status-msg success">{emailMsg}</span>}
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isVerifying || !isOtpComplete}
                style={{ marginTop: "12px" }}
              >
                {isVerifying ? "Verifying..." : "Verify & Activate"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-container">
            <FaCheckCircle className="success-icon" />
            <h2>Email Verified!</h2>
            <p className="success-text" style={{ marginBottom: "8px" }}>
              Your email has been successfully verified and account is activated.
            </p>
            <p className="success-note">
              Redirecting to login... Please sign in.
            </p>
            <div className="otp-spinner-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyOTPForm;
