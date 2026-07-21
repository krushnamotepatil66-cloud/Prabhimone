import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import "./Settings.css";
import {
  FiSettings,
  FiBriefcase,
  FiFileText,
  FiClipboard,
  FiCreditCard,
  FiFile,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiShield,
  FiSliders,
  FiChevronRight,
  FiCheck
} from "react-icons/fi";

const sidebarSections = [
  { key: "organization", label: "Organization", icon: FiBriefcase, desc: "Company profile & branding" },
  { key: "invoices", label: "Invoices", icon: FiFileText, desc: "Invoice numbering, defaults" },
  { key: "estimates", label: "Estimates", icon: FiClipboard, desc: "Estimate defaults & validity" },
  { key: "creditNotes", label: "Credit Notes", icon: FiCreditCard, desc: "Credit note preferences" },
  { key: "proforma", label: "Proforma Invoices", icon: FiFile, desc: "Proforma numbering & validity" },
  { key: "terms", label: "Terms & Conditions", icon: FiFileText, desc: "Default terms for documents" },
  { divider: true },
  { key: "customers", label: "Customers", icon: FiUsers, desc: "Default customer settings" },
  { key: "payments", label: "Payments", icon: FiDollarSign, desc: "Payment methods & modes" },
  { key: "expenses", label: "Expenses", icon: FiTag, desc: "Expense categories & defaults" },
  { divider: true },
  { key: "tax", label: "Tax & Compliance", icon: FiShield, desc: "GST, PAN & tax method" },
  { key: "preferences", label: "Preferences", icon: FiSliders, desc: "Date format, theme, language" },
];

/* ── Reusable Toggle component ── */
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider"></span>
    </label>
  );
}

function Settings() {
  const { settings, updateSettings } = useApp();
  // Ensure all fields have defaults even if old localStorage lacks new keys
  const defaults = {
    companyName: "", email: "", phone: "", address: "", city: "", zip: "",
    website: "", gstinOrg: "",
    currency: "₹", taxRate: 18, invoicePrefix: "INV-", invoiceAutoNumber: true,
    invoiceDefaultTerms: "Due on Receipt", invoiceDefaultNotes: "", invoiceShowGstin: true,
    invoiceTermsAndConditions: "1. Goods once sold will not be taken back or exchanged\n2. For warranty, retain cash memo\n3. Please check breakage and damage against delivery\n4. For order need to pay 50% advance amount\n5. All disputes are subject to PUNE jurisdiction only",
    estimatePrefix: "EST-", estimateAutoNumber: true, estimateValidityDays: 30,
    estimateDefaultNotes: "", estimateDefaultTerms: "1. This estimate is valid for 30 days from the date of issue.\n2. Any changes in specifications or quantities will alter the final pricing.",
    estimateTermsAndConditions: "1. This estimate is valid for 30 days from the date of issue.\n2. Any changes in specifications or quantities will alter the final pricing.\n3. Work will commence only upon approval of this estimate.\n4. All disputes are subject to PUNE jurisdiction only.",
    creditNotePrefix: "CN-", creditNoteAutoNumber: true, creditNoteDefaultNotes: "",
    creditNoteTermsAndConditions: "1. Credit balance must be applied to future invoices within 180 days.\n2. Refunds on credit notes are subject to review.\n3. Original invoice details must accompany any disputes.",
    proformaPrefix: "PI-", proformaAutoNumber: true, proformaValidityDays: 30, proformaDefaultNotes: "",
    proformaTermsAndConditions: "1. This proforma invoice is sent for approval before final billing.\n2. Prices and rates listed are subject to terms of agreement.\n3. Final tax invoice will be generated upon receipt of payment or approval.",
    customerDefaultType: "Existing", customerDefaultState: "Maharashtra",
    customerRequireEmail: false, customerRequirePhone: true,
    paymentDefaultMethod: "UPI", paymentModes: "UPI,Cash,Bank Transfer,Cheque,Credit Card,Debit Card",
    paymentShowReceipt: true,
    expenseDefaultCategory: "Office Supplies", expenseBillableDefault: false,
    expenseCategories: "Rent & Accommodation,Office Supplies,Travel Expenses,Utilities,Miscellaneous",
    gstRegistrationNo: "", panNumber: "", taxCalcMethod: "Exclusive", defaultTaxSlab: "18",
    dateFormat: "YYYY-MM-DD", numberFormat: "Indian", theme: "light", language: "English",
  };
  const [form, setForm] = useState({ ...defaults, ...settings });
  const [activeSection, setActiveSection] = useState("organization");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInput = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    setForm({ ...defaults, ...settings });
  };

  /* ══════════════════════════════════════════════════
     RENDER PANELS — one per sidebar section
     ══════════════════════════════════════════════════ */

  const renderOrganization = () => (
    <>
      <div className="settings-panel-header">
        <h1>Organization Profile</h1>
        <p>Business information displayed on invoices, estimates, and customer communications.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiBriefcase className="card-title-icon" /> Company Details</h3>
        <p className="settings-card-desc">Your legal business identity and contact information.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Company / Organization Name *</label>
            <input type="text" value={form.companyName} onChange={(e) => handleInput("companyName", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Email *</label>
            <input type="email" value={form.email} onChange={(e) => handleInput("email", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Phone</label>
            <input type="text" value={form.phone} onChange={(e) => handleInput("phone", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Website URL</label>
            <input type="url" value={form.website || ""} onChange={(e) => handleInput("website", e.target.value)} placeholder="https://yourcompany.com" />
          </div>
          <div className="form-group">
            <label>GSTIN / Tax ID</label>
            <input type="text" value={form.gstinOrg || ""} onChange={(e) => handleInput("gstinOrg", e.target.value)} placeholder="27AAAAA0000A1Z5" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📍 Address</h3>
        <p className="settings-card-desc">Registered office address for invoicing documents.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Street Address</label>
            <input type="text" value={form.address} onChange={(e) => handleInput("address", e.target.value)} placeholder="123 Business Hub, Building A" />
          </div>
          <div className="form-group">
            <label>City & State</label>
            <input type="text" value={form.city} onChange={(e) => handleInput("city", e.target.value)} placeholder="Mumbai, Maharashtra" />
          </div>
          <div className="form-group">
            <label>Postal Code / ZIP</label>
            <input type="text" value={form.zip} onChange={(e) => handleInput("zip", e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );

  const renderInvoices = () => (
    <>
      <div className="settings-panel-header">
        <h1>Invoice Settings</h1>
        <p>Configure default values for all newly created invoices.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiFileText className="card-title-icon" /> Numbering & Currency</h3>
        <p className="settings-card-desc">Control how invoice numbers are generated and displayed.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Invoice Number Prefix</label>
            <input type="text" value={form.invoicePrefix} onChange={(e) => handleInput("invoicePrefix", e.target.value)} placeholder="INV-" />
          </div>
          <div className="form-group">
            <label>Base Currency Symbol *</label>
            <select value={form.currency} onChange={(e) => handleInput("currency", e.target.value)}>
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
            <input type="number" min="0" max="100" step="0.1" value={form.taxRate === 0 ? "" : form.taxRate} onChange={(e) => handleInput("taxRate", Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Default Payment Terms</label>
            <select value={form.invoiceDefaultTerms} onChange={(e) => handleInput("invoiceDefaultTerms", e.target.value)}>
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15">Net 15 days</option>
              <option value="Net 30">Net 30 days</option>
              <option value="Net 45">Net 45 days</option>
              <option value="Net 60">Net 60 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Invoice Behavior</h3>
        <p className="settings-card-desc">Toggle automatic features for invoice generation.</p>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Auto-generate Invoice Numbers</span>
            <span className="toggle-desc">Automatically assign sequential invoice numbers on creation.</span>
          </div>
          <Toggle checked={form.invoiceAutoNumber} onChange={(v) => handleInput("invoiceAutoNumber", v)} />
        </div>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Show GSTIN on Invoice</span>
            <span className="toggle-desc">Display your GST registration number on printed invoices.</span>
          </div>
          <Toggle checked={form.invoiceShowGstin} onChange={(v) => handleInput("invoiceShowGstin", v)} />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📝 Default Footer Notes</h3>
        <p className="settings-card-desc">This text will appear at the bottom of every new invoice.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Default Notes / Footer</label>
            <textarea value={form.invoiceDefaultNotes} onChange={(e) => handleInput("invoiceDefaultNotes", e.target.value)} placeholder="Thank you for your business!" rows="3" />
          </div>
        </div>
      </div>
    </>
  );

  const renderEstimates = () => (
    <>
      <div className="settings-panel-header">
        <h1>Estimate Settings</h1>
        <p>Configure defaults for quotations and estimate documents.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiClipboard className="card-title-icon" /> Numbering & Validity</h3>
        <p className="settings-card-desc">Control estimate number format and default validity period.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Estimate Number Prefix</label>
            <input type="text" value={form.estimatePrefix} onChange={(e) => handleInput("estimatePrefix", e.target.value)} placeholder="EST-" />
          </div>
          <div className="form-group">
            <label>Default Validity Period (days)</label>
            <input type="number" min="1" max="365" value={form.estimateValidityDays} onChange={(e) => handleInput("estimateValidityDays", Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Estimate Behavior</h3>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Auto-generate Estimate Numbers</span>
            <span className="toggle-desc">Automatically assign sequential numbers when creating estimates.</span>
          </div>
          <Toggle checked={form.estimateAutoNumber} onChange={(v) => handleInput("estimateAutoNumber", v)} />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📝 Default Content</h3>
        <p className="settings-card-desc">Pre-fill notes and terms for new estimates.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Default Notes</label>
            <textarea value={form.estimateDefaultNotes} onChange={(e) => handleInput("estimateDefaultNotes", e.target.value)} placeholder="Notes shown on the estimate PDF..." rows="3" />
          </div>
          <div className="form-group full-width">
            <label>Default Terms & Conditions</label>
            <textarea value={form.estimateDefaultTerms} onChange={(e) => handleInput("estimateDefaultTerms", e.target.value)} rows="4" />
          </div>
        </div>
      </div>
    </>
  );

  const renderCreditNotes = () => (
    <>
      <div className="settings-panel-header">
        <h1>Credit Note Settings</h1>
        <p>Configure defaults for customer credit notes and refund documents.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiCreditCard className="card-title-icon" /> Numbering</h3>
        <p className="settings-card-desc">Control how credit note numbers are formatted.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Credit Note Number Prefix</label>
            <input type="text" value={form.creditNotePrefix} onChange={(e) => handleInput("creditNotePrefix", e.target.value)} placeholder="CN-" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Credit Note Behavior</h3>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Auto-generate Credit Note Numbers</span>
            <span className="toggle-desc">Automatically assign sequential numbers when creating credit notes.</span>
          </div>
          <Toggle checked={form.creditNoteAutoNumber} onChange={(v) => handleInput("creditNoteAutoNumber", v)} />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📝 Default Notes</h3>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Default Credit Note Notes</label>
            <textarea value={form.creditNoteDefaultNotes} onChange={(e) => handleInput("creditNoteDefaultNotes", e.target.value)} placeholder="Default notes for credit note PDFs..." rows="3" />
          </div>
        </div>
      </div>
    </>
  );

  const renderProforma = () => (
    <>
      <div className="settings-panel-header">
        <h1>Proforma Invoice Settings</h1>
        <p>Configure defaults for preliminary invoices sent before finalization.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiFile className="card-title-icon" /> Numbering & Validity</h3>
        <p className="settings-card-desc">Control proforma invoice number format and validity.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Proforma Invoice Prefix</label>
            <input type="text" value={form.proformaPrefix} onChange={(e) => handleInput("proformaPrefix", e.target.value)} placeholder="PI-" />
          </div>
          <div className="form-group">
            <label>Default Validity Period (days)</label>
            <input type="number" min="1" max="365" value={form.proformaValidityDays} onChange={(e) => handleInput("proformaValidityDays", Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Proforma Behavior</h3>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Auto-generate Proforma Numbers</span>
            <span className="toggle-desc">Automatically assign sequential numbers on creation.</span>
          </div>
          <Toggle checked={form.proformaAutoNumber} onChange={(v) => handleInput("proformaAutoNumber", v)} />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📝 Default Notes</h3>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Default Proforma Notes</label>
            <textarea value={form.proformaDefaultNotes} onChange={(e) => handleInput("proformaDefaultNotes", e.target.value)} placeholder="Notes shown on the proforma PDF..." rows="3" />
          </div>
        </div>
      </div>
    </>
  );

  const renderCustomers = () => (
    <>
      <div className="settings-panel-header">
        <h1>Customer Settings</h1>
        <p>Set defaults for how new customers are created and managed.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiUsers className="card-title-icon" /> Customer Defaults</h3>
        <p className="settings-card-desc">Pre-select values used when adding new customers.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Default Customer Type</label>
            <select value={form.customerDefaultType} onChange={(e) => handleInput("customerDefaultType", e.target.value)}>
              <option value="Walk-in">Walk-in</option>
              <option value="Existing">Existing</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div className="form-group">
            <label>Default State</label>
            <select value={form.customerDefaultState} onChange={(e) => handleInput("customerDefaultState", e.target.value)}>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Validation Rules</h3>
        <p className="settings-card-desc">Enforce required fields when adding customers.</p>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Require Email Address</span>
            <span className="toggle-desc">Make email a mandatory field for customer creation.</span>
          </div>
          <Toggle checked={form.customerRequireEmail} onChange={(v) => handleInput("customerRequireEmail", v)} />
        </div>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Require Phone Number</span>
            <span className="toggle-desc">Make phone number a mandatory field for customer creation.</span>
          </div>
          <Toggle checked={form.customerRequirePhone} onChange={(v) => handleInput("customerRequirePhone", v)} />
        </div>
      </div>
    </>
  );

  const renderPayments = () => (
    <>
      <div className="settings-panel-header">
        <h1>Payment Settings</h1>
        <p>Manage payment methods, modes, and receipt preferences.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiDollarSign className="card-title-icon" /> Payment Methods</h3>
        <p className="settings-card-desc">Configure the default method and available payment modes.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Default Payment Method</label>
            <select value={form.paymentDefaultMethod} onChange={(e) => handleInput("paymentDefaultMethod", e.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label>Available Payment Modes (comma-separated)</label>
            <input type="text" value={form.paymentModes} onChange={(e) => handleInput("paymentModes", e.target.value)} placeholder="UPI,Cash,Bank Transfer" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Receipt Options</h3>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Show Payment Receipt</span>
            <span className="toggle-desc">Automatically generate a payment receipt after recording a payment.</span>
          </div>
          <Toggle checked={form.paymentShowReceipt} onChange={(v) => handleInput("paymentShowReceipt", v)} />
        </div>
      </div>
    </>
  );

  const renderExpenses = () => (
    <>
      <div className="settings-panel-header">
        <h1>Expense Settings</h1>
        <p>Set up expense categories and default behavior for expense tracking.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiTag className="card-title-icon" /> Expense Defaults</h3>
        <p className="settings-card-desc">Pre-select category and billable status for new expenses.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Default Expense Category</label>
            <select value={form.expenseDefaultCategory} onChange={(e) => handleInput("expenseDefaultCategory", e.target.value)}>
              {(form.expenseCategories || "").split(",").filter(Boolean).map((cat) => (
                <option key={cat.trim()} value={cat.trim()}>{cat.trim()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">⚙️ Expense Behavior</h3>
        <div className="toggle-row">
          <div className="toggle-label-group">
            <span className="toggle-label">Billable by Default</span>
            <span className="toggle-desc">New expenses are marked as billable to clients by default.</span>
          </div>
          <Toggle checked={form.expenseBillableDefault} onChange={(v) => handleInput("expenseBillableDefault", v)} />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📋 Manage Categories</h3>
        <p className="settings-card-desc">Edit the list of available expense categories (comma-separated).</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <label>Expense Categories</label>
            <textarea value={form.expenseCategories} onChange={(e) => handleInput("expenseCategories", e.target.value)} rows="3" placeholder="Rent & Accommodation,Office Supplies,..." />
          </div>
        </div>
      </div>
    </>
  );

  const renderTax = () => (
    <>
      <div className="settings-panel-header">
        <h1>Tax & Compliance</h1>
        <p>Configure your GST registration, PAN details, and tax calculation method.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiShield className="card-title-icon" /> Registration Details</h3>
        <p className="settings-card-desc">Your tax identification numbers for compliance.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>GST Registration Number</label>
            <input type="text" value={form.gstRegistrationNo} onChange={(e) => handleInput("gstRegistrationNo", e.target.value)} placeholder="27AAAAA0000A1Z5" />
          </div>
          <div className="form-group">
            <label>PAN Number</label>
            <input type="text" value={form.panNumber} onChange={(e) => handleInput("panNumber", e.target.value)} placeholder="ABCDE1234F" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title">📊 Tax Calculation</h3>
        <p className="settings-card-desc">How taxes are applied to line item prices.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Tax Calculation Method</label>
            <select value={form.taxCalcMethod} onChange={(e) => handleInput("taxCalcMethod", e.target.value)}>
              <option value="Exclusive">Tax Exclusive (added on top of price)</option>
              <option value="Inclusive">Tax Inclusive (included in price)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Default Tax Slab (%)</label>
            <select value={form.defaultTaxSlab} onChange={(e) => handleInput("defaultTaxSlab", e.target.value)}>
              <option value="0">0% — Exempt</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18% — Standard GST</option>
              <option value="28">28%</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  const renderPreferences = () => (
    <>
      <div className="settings-panel-header">
        <h1>Preferences</h1>
        <p>Customize the application appearance, date formatting, and regional settings.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiSliders className="card-title-icon" /> Display & Regional</h3>
        <p className="settings-card-desc">Set your preferred formats for dates and numbers.</p>
        <div className="settings-form-grid">
          <div className="form-group">
            <label>Date Format</label>
            <select value={form.dateFormat} onChange={(e) => handleInput("dateFormat", e.target.value)}>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-17)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (17/07/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (07/17/2026)</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY (17-Jul-2026)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Number Format</label>
            <select value={form.numberFormat} onChange={(e) => handleInput("numberFormat", e.target.value)}>
              <option value="Indian">Indian (1,23,456.00)</option>
              <option value="International">International (123,456.00)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select value={form.language} onChange={(e) => handleInput("language", e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>
          <div className="form-group">
            <label>Theme</label>
            <select value={form.theme} onChange={(e) => handleInput("theme", e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark (Coming Soon)</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  const renderTerms = () => (
    <>
      <div className="settings-panel-header">
        <h1>Terms & Conditions</h1>
        <p>Define the default terms, conditions, and legal statements printed on your documents.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiFileText className="card-title-icon" /> Invoice Terms & Conditions</h3>
        <p className="settings-card-desc">Default terms of sale shown at the bottom of customer invoices.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <textarea
              value={form.invoiceTermsAndConditions}
              onChange={(e) => handleInput("invoiceTermsAndConditions", e.target.value)}
              rows="5"
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiClipboard className="card-title-icon" /> Estimate / Quotation Terms</h3>
        <p className="settings-card-desc">Validity clauses, pricing alterations, and acceptance terms for estimates.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <textarea
              value={form.estimateTermsAndConditions}
              onChange={(e) => handleInput("estimateTermsAndConditions", e.target.value)}
              rows="5"
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiCreditCard className="card-title-icon" /> Credit Note Terms</h3>
        <p className="settings-card-desc">Refund rules, credit duration, and adjustment details for credit notes.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <textarea
              value={form.creditNoteTermsAndConditions}
              onChange={(e) => handleInput("creditNoteTermsAndConditions", e.target.value)}
              rows="5"
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-card-title"><FiFile className="card-title-icon" /> Proforma Invoice Terms</h3>
        <p className="settings-card-desc">Preliminary terms of agreement and delivery details before final billing.</p>
        <div className="settings-form-grid">
          <div className="form-group full-width">
            <textarea
              value={form.proformaTermsAndConditions}
              onChange={(e) => handleInput("proformaTermsAndConditions", e.target.value)}
              rows="5"
            />
          </div>
        </div>
      </div>
    </>
  );

  /* Panel renderer map */
  const panelMap = {
    organization: renderOrganization,
    invoices: renderInvoices,
    estimates: renderEstimates,
    creditNotes: renderCreditNotes,
    proforma: renderProforma,
    terms: renderTerms,
    customers: renderCustomers,
    payments: renderPayments,
    expenses: renderExpenses,
    tax: renderTax,
    preferences: renderPreferences,
  };

  return (
    <DashboardLayout>
      <div className="settings-page-layout">
        {/* ── Settings Sidebar ── */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h2><FiSettings className="header-icon" /> Settings</h2>
            <p>Manage your application configuration</p>
          </div>

          <ul className="settings-sidebar-nav">
            {sidebarSections.map((item, idx) => {
              if (item.divider) {
                return <div key={`div-${idx}`} className="settings-nav-divider" />;
              }
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`settings-nav-item ${activeSection === item.key ? "active" : ""}`}
                    onClick={() => setActiveSection(item.key)}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    <FiChevronRight className="nav-chevron" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Settings Content ── */}
        <div className="settings-content-panel">
          {showSuccess && (
            <div className="settings-success-toast">
              <FiCheck /> Settings saved successfully! Changes applied globally.
            </div>
          )}

          {panelMap[activeSection] ? panelMap[activeSection]() : null}

          {/* Save / Reset row */}
          <div className="settings-save-row">
            <button type="button" className="settings-reset-btn" onClick={handleReset}>
              Reset Changes
            </button>
            <button type="button" className="settings-save-btn" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;