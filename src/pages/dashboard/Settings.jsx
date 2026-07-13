import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import "./Settings.css";

function Settings() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="subtitle">Configure your business profile, default currency, and tax parameters.</p>
        </div>

        {showSuccess && (
          <div className="success-toast">
            ✓ Settings saved successfully! Changes are applied globally.
          </div>
        )}

        <div className="settings-container">
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-section">
              <h3>Organization Profile</h3>
              <p className="section-description">This information will be displayed on invoices you send to customers.</p>

              <div className="form-grid">
                <div className="form-group-full">
                  <label>Company / Organization Name *</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => handleInput("companyName", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Business Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInput("email", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Business Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleInput("phone", e.target.value)}
                  />
                </div>

                <div className="form-group-full">
                  <label>Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Business Hub, Building A"
                    value={form.address}
                    onChange={(e) => handleInput("address", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>City & State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={form.city}
                    onChange={(e) => handleInput("city", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code / ZIP</label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => handleInput("zip", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <hr className="settings-divider" />

            <div className="settings-section">
              <h3>Invoicing & Taxation</h3>
              <p className="section-description">Set up your base currency and default taxation for newly created invoices.</p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Base Currency Symbol *</label>
                  <select
                    value={form.currency}
                    onChange={(e) => handleInput("currency", e.target.value)}
                    required
                  >
                    <option value="₹">₹ (INR - Rupee)</option>
                    <option value="$">$ (USD - Dollar)</option>
                    <option value="€">€ (EUR - Euro)</option>
                    <option value="£">£ (GBP - Pound)</option>
                    <option value="¥">¥ (JPY - Yen)</option>
                    <option value="AED">AED (Dirham)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.taxRate === 0 ? "" : form.taxRate}
                    onChange={(e) => handleInput("taxRate", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-settings-btn">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;