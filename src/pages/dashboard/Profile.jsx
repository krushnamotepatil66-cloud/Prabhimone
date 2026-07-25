import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import { clearTokens } from "../../api/client";
import { FiLogOut } from "react-icons/fi";
import "./Profile.css";

const avatarsList = ["👨‍💻", "👩‍💻", "🧑‍💼", "🚀", "💼", "⭐", "🎨", "🤖"];

import { isRequiredEmailValid, isValidMobile, sanitizeMobileInput } from "../../utils/validation";

function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState({
    name: profile.name || "Aditya B.",
    email: profile.email || "aditya@example.com",
    phone: profile.phone || "+91-9403301412",
    role: profile.role || "Admin / Business Owner",
    designation: profile.designation || "Director",
    avatarUrl: profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    timeZone: profile.timeZone || "(GMT+05:30) India Standard Time",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleInput = (field, value) => {
    let finalVal = value;
    if (field === "phone") {
      finalVal = sanitizeMobileInput(value);
    }
    setForm((prev) => ({
      ...prev,
      [field]: finalVal,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!isRequiredEmailValid(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (form.phone && !isValidMobile(form.phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    updateProfile(form);
    showSuccess("✓ Personal details updated successfully!");
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordForm({ oldPass: "", newPass: "", confirmPass: "" });
    showSuccess("✓ Password changed successfully!");
  };

  const showSuccess = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleLogout = () => {
    clearTokens();
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Account Profile</h1>
          <p className="subtitle">Manage your credentials, preferences, and security settings.</p>
        </div>

        {showToast && (
          <div className="success-toast">
            {toastMessage}
          </div>
        )}

        <div className="profile-layout-grid">
          {/* Left Column: Form Info */}
          <div className="profile-main-card">
            <form onSubmit={handleSaveProfile} className="profile-form">
              <h3>Personal Details</h3>
              <p className="form-subtext">Update your professional contact details and app preferences.</p>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInput("name", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInput("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleInput("phone", e.target.value)}
                    placeholder="ex. +91-9876543210"
                  />
                </div>

                <div className="form-group">
                  <label>System Role</label>
                  <input
                    type="text"
                    value={form.role}
                    disabled
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Choose Avatar Icon or Upload Profile Picture</label>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px", marginTop: "6px" }}>
                  <label className="secondary-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleInput("profilePic", reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                  {form.profilePic && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleInput("profilePic", "")}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <div className="avatar-options-grid">
                  {avatarsList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`avatar-option-btn ${form.avatar === emoji && !form.profilePic ? "active-avatar" : ""}`}
                      onClick={() => {
                        handleInput("avatar", emoji);
                        handleInput("profilePic", "");
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Theme Preference</label>
                <div className="theme-toggle-row">
                  <button
                    type="button"
                    className={`theme-selection-btn ${form.theme === "light" ? "active-theme" : ""}`}
                    onClick={() => handleInput("theme", "light")}
                  >
                    ☀️ Light Mode
                  </button>
                  <button
                    type="button"
                    className={`theme-selection-btn ${form.theme === "dark" ? "active-theme" : ""}`}
                    onClick={() => handleInput("theme", "dark")}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>

              <div className="form-actions-profile">
                <button type="submit" className="save-profile-btn">
                  Save Personal Info
                </button>
              </div>
            </form>

            <hr className="profile-divider" />

            {/* Change Password Panel */}
            <form onSubmit={handleSavePassword} className="profile-form">
              <h3>Change Password</h3>
              <p className="form-subtext">Ensure your account remains secure by changing passwords frequently.</p>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.oldPass}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPass: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={passwordForm.newPass}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPass: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={passwordForm.confirmPass}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPass: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-actions-profile">
                <button type="submit" className="save-password-btn">
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Visual Summary */}
          <div className="profile-side-card">
            <div className="profile-visual-avatar" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px" }}>
              {form.profilePic ? (
                <img src={form.profilePic} alt="Profile" style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "2px solid #8b5cf6" }} />
              ) : (
                <span className="big-profile-emoji" style={{ margin: 0 }}>{form.avatar}</span>
              )}
            </div>
            <h2>{form.name}</h2>
            <span className="profile-badge-role">{form.role}</span>
            <p className="profile-email-text">{form.email}</p>

            <div className="profile-meta-details">
              <div className="meta-item">
                <span>Account Status</span>
                <strong className="active-text">Active</strong>
              </div>
              <div className="meta-item">
                <span>API Keys</span>
                <strong>Configured</strong>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #f87171",
                borderRadius: "6px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#fecaca"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fee2e2"; }}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;