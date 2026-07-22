import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import "./Profile.css";

const avatarsList = ["👨‍💻", "👩‍💻", "🧑‍💼", "🚀", "💼", "⭐", "🎨", "🤖"];

function Profile() {
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState(profile);
  const [passwordForm, setPasswordForm] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
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
                    placeholder="+91 XXXXX XXXXX"
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
                <label>Choose Avatar Icon</label>
                <div className="avatar-options-grid">
                  {avatarsList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`avatar-option-btn ${form.avatar === emoji ? "active-avatar" : ""}`}
                      onClick={() => handleInput("avatar", emoji)}
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
            <div className="profile-visual-avatar">
              <span className="big-profile-emoji">{form.avatar}</span>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;