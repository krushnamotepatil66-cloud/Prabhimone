import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import "../Login/LoginForm.css";

function VerifyOTPForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve passed email or fallback
  const email = location.state?.email || "your email address";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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

  const handleResendEmail = () => {
    if (emailCooldown > 0) return;
    setEmailCooldown(30);
    setEmailMsg("A fresh code has been sent to your email!");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;

    setIsVerifying(true);

    // Simulate API code verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);

      // Auto redirect to dashboard after 2.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    }, 1800);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>InvoicePro</h1>

        {!isVerified ? (
          <>
            <h2>Verify Your Account</h2>
            <p className="description-text">
              We've sent a 6-digit verification code (OTP) to:
              <br />
              <strong style={{ color: "#1e293b", wordBreak: "break-all" }}>{email}</strong>
            </p>

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
              Preparing your dashboard... Redirecting shortly.
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
