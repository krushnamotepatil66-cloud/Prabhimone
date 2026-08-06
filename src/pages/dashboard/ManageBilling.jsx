import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { FiArrowLeft, FiCreditCard, FiCalendar, FiDownload, FiShield,
  FiCheck, FiAlertTriangle, FiRefreshCw, FiXCircle, FiEdit2,
  FiLock, FiZap, FiStar, FiBriefcase, FiExternalLink
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import "./ManageBilling.css";
import generateInvoicePDF from "../../utils/generateInvoicePDF";
import InvoicePreview from "../../components/Invoice/InvoicePreview";

// Default plan skeleton (used only if settings.subscriptionPlan is not set)
const DEFAULT_PLAN = {
  name: "Free",
  price: 0,
  billing: "Monthly",
  color: "#64748b",
  nextBillingDate: null,
  trialEndsDate: null,
  status: "active",
  startedOn: null,
};

// Empty payment method (shown before first payment)
const EMPTY_PAYMENT_METHOD = {
  type: "none",
};

const plans = [
  {
    name: "Starter",
    icon: FiZap,
    price: 49,
    period: "/month",
    color: "#3b82f6", // blue
    button: "Get Started",
    trialBadge: true,
    description: "Perfect for freelancers and solo entrepreneurs.",
    features: [
      "5 Invoices / Month",
      "2 Users",
      "Email Support",
      "Basic Dashboard",
      "PDF Export",
    ],
    unavailable: ["Advanced Reports", "API Access", "Dedicated Manager"],
  },
  {
    name: "Professional",
    icon: FiStar,
    price: 99,
    period: "/month",
    color: "#6366f1", // indigo
    featured: true,
    button: "Start Free Trial",
    trialBadge: true,
    description: "Ideal for growing businesses that need more power.",
    features: [
      "Unlimited Invoices",
      "Unlimited Users",
      "Advanced Reports",
      "Payment Tracking",
      "Priority Support",
      "GST & Tax Reports",
      "PDF & Excel Export",
    ],
    unavailable: ["Dedicated Manager", "API Access"],
  },
  {
    name: "Enterprise",
    icon: FiBriefcase,
    price: 149,
    period: "/month",
    color: "#64748b", // slate
    button: "Start Free Trial",
    trialBadge: true,
    contactSales: false,
    description: "Tailored solutions for large-scale operations.",
    features: [
      "Everything Included",
      "Dedicated Account Manager",
      "Custom Integrations",
      "API Access",
      "24/7 Priority Support",
      "SLA Guarantee",
      "Custom Branding",
    ],
    unavailable: [],
  },
];

/* ─────────────────────────────────────────────────────────────
   BILLING HISTORY TAB — Standalone component (no context bugs)
   ───────────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  paid:      { bg: "#dcfce7", color: "#16a34a", border: "#86efac", icon: "✓" },
  unpaid:    { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", icon: "!" },
  pending:   { bg: "#fef3c7", color: "#d97706", border: "#fde68a", icon: "⏳" },
  refunded:  { bg: "#e0e7ff", color: "#4f46e5", border: "#a5b4fc", icon: "↩" },
};

function InvoiceCard({ inv, index, onDownload }) {
  const statusKey = (inv.status || "paid").toLowerCase();
  const style = STATUS_STYLE[statusKey] || STATUS_STYLE.paid;
  const isRazorpay = !!inv.razorpayPaymentId;

  return (
    <div className="bh-invoice-card">
      {/* Left accent bar */}
      <div className="bh-card-accent" style={{ background: style.color }} />

      <div className="bh-card-body">
        {/* Top row */}
        <div className="bh-card-top">
          <div className="bh-card-id-wrap">
            <div className="bh-card-index">#{String(index + 1).padStart(2, "0")}</div>
            <div>
              <div className="bh-card-inv-id">{inv.id || `INV-00${index + 1}`}</div>
              <div className="bh-card-date">{inv.date || "—"}</div>
            </div>
          </div>

          <div className="bh-card-right">
            <div className="bh-card-amount">₹{Number(inv.amount || 0).toLocaleString("en-IN")}</div>
            <span
              className="bh-status-pill"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              {style.icon} {inv.status || "Paid"}
            </span>
          </div>
        </div>

        {/* Mid row — plan info */}
        <div className="bh-card-meta">
          <div className="bh-card-meta-item">
            <span className="bh-meta-label">Plan</span>
            <span className="bh-meta-val">{inv.plan || "—"}</span>
          </div>
          <div className="bh-card-meta-item">
            <span className="bh-meta-label">Description</span>
            <span className="bh-meta-val">{inv.description || "Subscription payment"}</span>
          </div>
          {isRazorpay && (
            <div className="bh-card-meta-item">
              <span className="bh-meta-label">Razorpay ID</span>
              <code className="bh-rzp-id-pill">⚡ {inv.razorpayPaymentId}</code>
            </div>
          )}
        </div>

        {/* Bottom — actions */}
        <div className="bh-card-actions">
          {isRazorpay && (
            <span className="bh-rzp-badge">⚡ Paid via Razorpay</span>
          )}
          <button className="bh-download-btn" onClick={() => onDownload(inv)}>
            <FiDownload size={13} /> Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingHistoryTab({ historyList, plan, handleDownloadInvoice }) {
  // Defensive: always guarantee we have an array
  const safeList = Array.isArray(historyList) && historyList.length > 0
    ? historyList
    : [];

  const totalPaid = safeList
    .filter(i => (i.status || "").toLowerCase() === "paid")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <div className="mb-tab-content">
      {/* Summary bar */}
      <div className="bh-summary-bar">
        <div className="bh-summary-item">
          <span className="bh-summary-label">Total Invoices</span>
          <span className="bh-summary-val">{safeList.length}</span>
        </div>
        <div className="bh-summary-sep" />
        <div className="bh-summary-item">
          <span className="bh-summary-label">Total Paid</span>
          <span className="bh-summary-val green">₹{totalPaid.toLocaleString("en-IN")}</span>
        </div>
        <div className="bh-summary-sep" />
        <div className="bh-summary-item">
          <span className="bh-summary-label">Current Plan</span>
          <span className="bh-summary-val">{plan?.name || "—"}</span>
        </div>
      </div>

      {/* Invoice list */}
      {safeList.length === 0 ? (
        <div className="bh-empty">
          <div className="bh-empty-icon">📋</div>
          <div className="bh-empty-title">No billing history yet</div>
          <div className="bh-empty-sub">
            Complete a subscription payment and your invoices will appear here.
          </div>
        </div>
      ) : (
        <div className="bh-invoice-list">
          {safeList.map((inv, idx) => (
            <InvoiceCard
              key={inv.id || idx}
              inv={inv}
              index={idx}
              onDownload={handleDownloadInvoice}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ManageBilling() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateCardModal, setShowUpdateCardModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelStep, setCancelStep] = useState(1); // 1 = confirm, 2 = reason, 3 = done
  const { settings, updateSettings } = useApp();
  const isCancelledGlobally = settings?.subscriptionStatus === "cancelled";
  const [cancelled, setCancelled] = useState(isCancelledGlobally);

  // Card update form
  const [newCard, setNewCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [cardSaved, setCardSaved] = useState(false);
  const [cardSaving, setCardSaving] = useState(false);
  const [cardErrors, setCardErrors] = useState({});
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  const purchasedPlanName = settings?.subscriptionPlan || null;
  const matchedPlan = plans.find(p => p.name === purchasedPlanName) || null;
  const dynamicCurrentPlan = matchedPlan
    ? {
        ...DEFAULT_PLAN,
        name: matchedPlan.name,
        price: matchedPlan.price,
        color: matchedPlan.color,
        status: settings?.subscriptionStatus || "active",
      }
    : { ...DEFAULT_PLAN };

  const savedPM = settings?.savedPaymentMethod;
  // Determine what kind of payment was used
  const isRazorpay = savedPM?.type === "razorpay";
  const paymentInfo = savedPM || EMPTY_PAYMENT_METHOD;

  // Extract billing history safely at component level (not inside JSX IIFE)
  const historyList = Array.isArray(settings?.billingHistory) ? settings.billingHistory : [];

  const plan = (cancelled || isCancelledGlobally) ? { ...dynamicCurrentPlan, status: "cancelled" } : dynamicCurrentPlan;
  const daysUntilBilling = plan.nextBillingDate
    ? Math.ceil((new Date(plan.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const formatCard = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  const handleDownloadInvoice = (inv) => {
    // Map billing history item to the standard Invoice format
    const mappedInv = {
      id: inv.id || "INV-SUB-001",
      date: inv.date || new Date().toISOString().split("T")[0],
      dueDate: inv.date || new Date().toISOString().split("T")[0],
      customer: settings?.companyName || "Valued Customer",
      status: inv.status || "Paid",
      amount: inv.amount,
      items: [
        {
          product: `${inv.plan || "Subscription"}`,
          description: inv.description || "Subscription Payment",
          qty: 1,
          price: Number(inv.amount) || 0,
          tax: 0,
          discount: 0,
          discountType: "flat"
        }
      ],
      additionalCharges: 0,
      autoRoundOff: false,
    };

    setDownloadingInvoice(mappedInv);

    // Give React time to render the hidden InvoicePreview to the DOM
    setTimeout(async () => {
      try {
        await generateInvoicePDF(mappedInv, settings);
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setDownloadingInvoice(null);
      }
    }, 600); // 600ms delay to ensure styles and elements are fully rendered
  };

  const handleSaveCard = () => {
    const errs = {};
    if (!newCard.name.trim()) errs.name = "Name is required";
    if (newCard.number.replace(/\s/g, "").length < 16) errs.number = "Enter valid 16-digit card";
    if (newCard.expiry.length < 5) errs.expiry = "Enter valid expiry MM/YY";
    if (newCard.cvv.length < 3) errs.cvv = "Enter valid CVV";
    setCardErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCardSaving(true);
    setTimeout(() => {
      setCardSaving(false);
      setCardSaved(true);
      setTimeout(() => {
        setShowUpdateCardModal(false);
        setCardSaved(false);
        setNewCard({ name: "", number: "", expiry: "", cvv: "" });
      }, 1500);
    }, 1800);
  };

  const handleCancelSubscription = () => {
    if (cancelStep === 1) { setCancelStep(2); return; }
    if (cancelStep === 2) {
      setCancelStep(3);
      setCancelled(true);
      if (updateSettings && settings) {
        updateSettings({ ...settings, subscriptionStatus: "cancelled" });
      }
    }
  };

  const statusColors = {
    active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
    trialing: { bg: "#e0e7ff", color: "#4f46e5", label: "Free Trial" },
    cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
    past_due: { bg: "#fef3c7", color: "#d97706", label: "Past Due" },
  };
  const statusStyle = statusColors[plan.status] || statusColors.active;

  return (
    <DashboardLayout>
      <div className="mb-page">

        {/* ── Back Button ── */}
        <button className="mb-back-btn" onClick={() => navigate("/dashboard/subscription")}>
          <FiArrowLeft size={15} /> Back to Plans
        </button>

        {/* ── Page Header ── */}
        <div className="mb-page-header">
          <div>
            <h1 className="mb-title">Manage Billing</h1>
            <p className="mb-subtitle">View and manage your subscription, payment method, and billing history.</p>
          </div>
          <div className="mb-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
            <FiCheck size={13} /> {statusStyle.label}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-tabs">
          {[
            { id: "overview", label: "Overview" },
            { id: "payment", label: "Payment Method" },
            { id: "history", label: "Billing History" },
            { id: "plan", label: "Change Plan" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`mb-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════ TAB: OVERVIEW ══════════════════════════ */}
        {activeTab === "overview" && (
          <div className="mb-tab-content">
            <div className="mb-overview-grid">

              {/* Current Plan Card */}
              <div className="mb-card">
                <div className="mb-card-header">
                  <div>
                    <div className="mb-card-label">Current Plan</div>
                    <div className="mb-plan-name" style={{ color: matchedPlan ? plan.color : "#94a3b8" }}>
                      {matchedPlan ? plan.name : "No Active Plan"}
                    </div>
                  </div>
                  <div className="mb-plan-price-display">
                    {matchedPlan ? (
                      <>
                        <span className="mb-plan-price">₹{plan.price}</span>
                        <span className="mb-plan-period">/{plan.billing === "Monthly" ? "mo" : "yr"}</span>
                      </>
                    ) : (
                      <span className="mb-plan-price" style={{ color: "#94a3b8", fontSize: "15px" }}>Free</span>
                    )}
                  </div>
                </div>
                <div className="mb-divider" />
                {matchedPlan ? (
                  <div className="mb-info-rows">
                    <div className="mb-info-row">
                      <span className="mb-info-label"><FiCalendar size={13} /> Billing Cycle</span>
                      <span className="mb-info-val">{plan.billing}</span>
                    </div>
                    <div className="mb-info-row">
                      <span className="mb-info-label"><FiRefreshCw size={13} /> Next Billing</span>
                      <span className="mb-info-val">
                        {plan.nextBillingDate || "—"}
                        {daysUntilBilling !== null && (
                          <span className="mb-days-badge">{daysUntilBilling}d</span>
                        )}
                      </span>
                    </div>
                    <div className="mb-info-row">
                      <span className="mb-info-label"><FiCalendar size={13} /> Member Since</span>
                      <span className="mb-info-val">{plan.startedOn || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "16px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    You haven't subscribed to a plan yet.
                  </div>
                )}
                <div className="mb-card-actions">
                  <button className="mb-btn-outline" onClick={() => setActiveTab("plan")}>
                    <FiZap size={13} /> {matchedPlan ? "Change Plan" : "View Plans"}
                  </button>
                  {matchedPlan && plan.status !== "cancelled" && (
                    <button className="mb-btn-danger-outline" onClick={() => setShowCancelModal(true)}>
                      <FiXCircle size={13} /> Cancel Plan
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="mb-card">
                <div className="mb-card-header">
                  <div>
                    <div className="mb-card-label">Payment Method</div>
                    <div className="mb-card-brand">
                      {isRazorpay ? "Razorpay" : paymentInfo.type === "upi" ? "UPI" : paymentInfo.type === "wallet" ? "Wallet" : (paymentInfo.brand || "Card")}
                    </div>
                  </div>
                  <div className="mb-card-chip">
                    {isRazorpay
                      ? <span style={{ fontSize: "22px" }}>⚡</span>
                      : paymentInfo.type === "upi" ? <span style={{ fontSize: "22px" }}>🏦</span>
                      : paymentInfo.type === "wallet" ? <span style={{ fontSize: "22px" }}>📱</span>
                      : <FiCreditCard size={22} />}
                  </div>
                </div>
                <div className="mb-divider" />
                <div className="mb-info-rows">
                  {isRazorpay ? (
                    <>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Gateway</span>
                        <span className="mb-info-val mb-rzp-badge">Razorpay</span>
                      </div>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Payment ID</span>
                        <span className="mb-info-val mb-rzp-pid">{paymentInfo.paymentId || "—"}</span>
                      </div>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Mode</span>
                        <span className="mb-info-val">Razorpay Checkout</span>
                      </div>
                    </>
                  ) : paymentInfo.type === "upi" ? (
                    <div className="mb-info-row">
                      <span className="mb-info-label">UPI ID</span>
                      <span className="mb-info-val">{paymentInfo.upiId}</span>
                    </div>
                  ) : paymentInfo.type === "wallet" ? (
                    <div className="mb-info-row">
                      <span className="mb-info-label">Method</span>
                      <span className="mb-info-val">Digital Wallet</span>
                    </div>
                  ) : (
                    <>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Card Number</span>
                        <span className="mb-info-val mb-card-number">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {paymentInfo.last4}</span>
                      </div>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Cardholder</span>
                        <span className="mb-info-val">{paymentInfo.name}</span>
                      </div>
                      <div className="mb-info-row">
                        <span className="mb-info-label">Expires</span>
                        <span className="mb-info-val">{paymentInfo.expiry}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="mb-card-actions">
                  {isRazorpay ? (
                    <a
                      className="mb-btn-primary mb-rzp-link-btn"
                      href={`https://dashboard.razorpay.com/app/payments/${paymentInfo.paymentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiExternalLink size={13} /> View in Razorpay Dashboard
                    </a>
                  ) : (
                    <button className="mb-btn-primary" onClick={() => setShowUpdateCardModal(true)}>
                      <FiEdit2 size={13} /> Update Card
                    </button>
                  )}
                </div>
              </div>

              {/* Next Invoice Preview */}
              {plan.status !== "cancelled" && (
                <div className="mb-card mb-next-invoice-card">
                  <div className="mb-card-label">Upcoming Invoice</div>
                  <div className="mb-next-invoice-amount">₹{plan.price}</div>
                  <div className="mb-next-invoice-date">
                    Scheduled for <strong>{plan.nextBillingDate}</strong>
                  </div>
                  <div className="mb-divider" />
                  <div className="mb-info-rows">
                    <div className="mb-info-row">
                      <span className="mb-info-label">Plan</span>
                      <span className="mb-info-val">{plan.name} – {plan.billing}</span>
                    </div>
                    <div className="mb-info-row">
                      <span className="mb-info-label">Charged via</span>
                      <span className="mb-info-val">
                        {isRazorpay
                          ? <span className="mb-rzp-badge">Razorpay</span>
                          : paymentInfo.type === "upi"
                          ? `UPI — ${paymentInfo.upiId}`
                          : paymentInfo.type === "wallet"
                          ? "Digital Wallet"
                          : `${paymentInfo.brand || "Card"} ••••${paymentInfo.last4}`
                        }
                      </span>
                    </div>
                    {isRazorpay && paymentInfo.paymentId && (
                      <div className="mb-info-row">
                        <span className="mb-info-label">Last Payment ID</span>
                        <span className="mb-info-val mb-rzp-pid-sm">{paymentInfo.paymentId}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-secure-note">
                    <FiLock size={12} /> Payments are SSL encrypted and secure.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════ TAB: PAYMENT METHOD ══════════════════════════ */}
        {activeTab === "payment" && (
          <div className="mb-tab-content">
            <div className="mb-card mb-payment-method-full">
              <h3 className="mb-section-title">Saved Payment Method</h3>

              {isRazorpay ? (
                /* ── Razorpay payment display ── */
                <div className="mb-rzp-payment-display">
                  <div className="mb-rzp-payment-header">
                    <div className="mb-rzp-icon-wrap">
                      <span style={{ fontSize: "36px" }}>⚡</span>
                    </div>
                    <div>
                      <div className="mb-rzp-gateway-name">Razorpay</div>
                      <div className="mb-rzp-gateway-sub">Payment processed via Razorpay Checkout</div>
                    </div>
                    <div className="mb-rzp-verified-badge">
                      <FiCheck size={11} /> Verified
                    </div>
                  </div>

                  <div className="mb-rzp-details-grid">
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Payment ID</span>
                      <code className="mb-rzp-detail-val">{paymentInfo.paymentId || "—"}</code>
                    </div>
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Gateway</span>
                      <span className="mb-rzp-detail-val">Razorpay</span>
                    </div>
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Mode</span>
                      <span className="mb-rzp-detail-val">Online Checkout</span>
                    </div>
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Plan</span>
                      <span className="mb-rzp-detail-val">{plan.name} – {plan.billing}</span>
                    </div>
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Amount</span>
                      <span className="mb-rzp-detail-val">₹{plan.price}</span>
                    </div>
                    <div className="mb-rzp-detail-item">
                      <span className="mb-rzp-detail-label">Currency</span>
                      <span className="mb-rzp-detail-val">INR</span>
                    </div>
                  </div>

                  <a
                    className="mb-btn-primary mb-rzp-link-btn"
                    href={`https://dashboard.razorpay.com/app/payments/${paymentInfo.paymentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
                  >
                    <FiExternalLink size={14} /> View in Razorpay Dashboard
                  </a>

                  <div className="mb-rzp-test-note">
                    🧪 This is a test mode payment. No real money was charged.
                  </div>
                </div>
              ) : paymentInfo.type === "upi" ? (
                /* UPI display */
                <div className="mb-upi-display" style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "12px" }}>🏦</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>UPI Payment</div>
                  <div style={{ fontSize: "15px", color: "#6366f1", marginTop: "6px", fontWeight: 600 }}>{paymentInfo.upiId}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>This UPI ID is linked to your subscription.</div>
                </div>
              ) : paymentInfo.type === "wallet" ? (
                /* Wallet display */
                <div style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "12px" }}>📱</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>Digital Wallet</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>Payment via digital wallet is linked to your subscription.</div>
                </div>
              ) : (
                /* Card display */
                <div className="mb-visual-card" style={{ background: `linear-gradient(135deg, ${plan.color}, #1e293b)` }}>
                  <div className="mb-vc-brand">{paymentInfo.brand || "Card"}</div>
                  <div className="mb-vc-number">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {paymentInfo.last4}</div>
                  <div className="mb-vc-footer">
                    <div>
                      <div className="mb-vc-label">CARDHOLDER</div>
                      <div className="mb-vc-val">{paymentInfo.name}</div>
                    </div>
                    <div>
                      <div className="mb-vc-label">EXPIRES</div>
                      <div className="mb-vc-val">{paymentInfo.expiry}</div>
                    </div>
                  </div>
                </div>
              )}

              {!isRazorpay && (
                <button className="mb-btn-primary mb-update-card-btn" onClick={() => setShowUpdateCardModal(true)}>
                  <FiEdit2 size={14} /> Update Payment Method
                </button>
              )}

              <div className="mb-payment-trust">
                <div className="mb-trust-item"><FiShield size={14} /> PCI DSS Compliant</div>
                <div className="mb-trust-item"><FiLock size={14} /> 256-bit SSL Encrypted</div>
                <div className="mb-trust-item"><FiCheck size={14} /> RBI Regulated</div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ TAB: BILLING HISTORY ══════════════════════════ */}
        {activeTab === "history" && (
          <BillingHistoryTab
            historyList={historyList}
            plan={plan}
            handleDownloadInvoice={handleDownloadInvoice}
          />
        )}

        {/* ══════════════════════════ TAB: CHANGE PLAN ══════════════════════════ */}
        {activeTab === "plan" && (
          <div className="mb-tab-content">
            <div className="mb-change-plan-grid">
              {plans.map((p) => {
                const Icon = p.icon;
                const isCurrent = p.name === plan.name;
                const isEnterprise = p.name === "Enterprise";

                return (
                  <div key={p.name} className={`mb-change-plan-card ${isCurrent ? "current" : ""} ${isEnterprise ? "enterprise" : ""}`}
                    style={!isEnterprise ? { borderColor: isCurrent ? p.color : undefined } : {}}>
                    {isCurrent && <div className="mb-current-badge" style={{ background: p.color }}>Current Plan</div>}
                    <div className={`mb-cp-icon ${isEnterprise ? "enterprise-icon" : ""}`} style={!isEnterprise ? { background: p.color + "20", color: p.color } : {}}>
                      {isEnterprise ? "🏢" : <Icon size={20} />}
                    </div>
                    <h3 className="mb-cp-name">{p.name}</h3>
                    <div className={`mb-cp-price ${isEnterprise ? "enterprise-price" : ""}`}>
                      {p.price !== null ? `₹${p.price}` : "Custom"}
                      {p.price !== null && <span>/mo</span>}
                    </div>
                    
                    <ul className="mb-cp-features">
                      {p.features.map((f) => (
                        <li key={f}><FiCheck size={12} /> {f}</li>
                      ))}
                    </ul>
                    <button
                      className={`mb-cp-btn ${isCurrent ? "current" : ""} ${isEnterprise ? "enterprise-btn" : ""}`}
                      style={!isCurrent && !isEnterprise ? { background: p.color, borderColor: p.color } : {}}
                      onClick={() => {
                        if (!isCurrent) {
                          navigate(`/dashboard/subscription/payment?plan=${encodeURIComponent(p.name)}&billing=Monthly`);
                        }
                      }}
                      disabled={isCurrent}
                    >
                      {isCurrent ? "✓ Current Plan" : `Switch to ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Hidden Invoice Preview for PDF Generation */}
      {downloadingInvoice && (
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px", visibility: "hidden", pointerEvents: "none" }}>
          <InvoicePreview 
            invoice={downloadingInvoice} 
            onClose={() => {}} 
            onEdit={() => {}} 
            onDelete={() => {}} 
          />
        </div>
      )}

      {/* ══════════════════════════ UPDATE CARD MODAL ══════════════════════════ */}
      {showUpdateCardModal && (
        <div className="mb-modal-overlay" onClick={() => { if (!cardSaving) setShowUpdateCardModal(false); }}>
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h3><FiCreditCard size={18} /> Update Payment Method</h3>
              <button className="mb-modal-close" onClick={() => setShowUpdateCardModal(false)}>✕</button>
            </div>

            {cardSaved ? (
              <div className="mb-modal-success">
                <div className="mb-success-check">✓</div>
                <p>Payment method updated successfully!</p>
              </div>
            ) : (
              <div className="mb-modal-body">
                <div className="mb-form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="Name as on card"
                    value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    className={cardErrors.name ? "error" : ""} />
                  {cardErrors.name && <span className="mb-err">{cardErrors.name}</span>}
                </div>

                <div className="mb-form-group">
                  <label>Card Number</label>
                  <div className="mb-card-input-wrap">
                    <FiCreditCard size={16} className="mb-card-icon" />
                    <input type="text" placeholder="1234 5678 9012 3456"
                      value={newCard.number}
                      onChange={(e) => setNewCard({ ...newCard, number: formatCard(e.target.value) })}
                      className={cardErrors.number ? "error" : ""} inputMode="numeric" />
                  </div>
                  {cardErrors.number && <span className="mb-err">{cardErrors.number}</span>}
                </div>

                <div className="mb-form-row">
                  <div className="mb-form-group">
                    <label>Expiry (MM/YY)</label>
                    <input type="text" placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                      className={cardErrors.expiry ? "error" : ""} inputMode="numeric" />
                    {cardErrors.expiry && <span className="mb-err">{cardErrors.expiry}</span>}
                  </div>
                  <div className="mb-form-group">
                    <label>CVV</label>
                    <input type="password" placeholder="•••" maxLength={4}
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      className={cardErrors.cvv ? "error" : ""} inputMode="numeric" />
                    {cardErrors.cvv && <span className="mb-err">{cardErrors.cvv}</span>}
                  </div>
                </div>

                <button
                  className={`mb-modal-submit ${cardSaving ? "loading" : ""}`}
                  onClick={handleSaveCard}
                  disabled={cardSaving}
                >
                  {cardSaving ? <span className="mb-spinner" /> : <><FiLock size={14} /> Save Payment Method</>}
                </button>
                <p className="mb-secure-note-sm"><FiLock size={11} /> SSL encrypted. We never store your full card details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════ CANCEL SUBSCRIPTION MODAL ══════════════════════════ */}
      {showCancelModal && (
        <div className="mb-modal-overlay" onClick={() => { if (cancelStep !== 3) setShowCancelModal(false); }}>
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            {cancelStep !== 3 && (
              <div className="mb-modal-header">
                <h3><FiAlertTriangle size={18} color="#ef4444" /> Cancel Subscription</h3>
                <button className="mb-modal-close" onClick={() => { setShowCancelModal(false); setCancelStep(1); }}>✕</button>
              </div>
            )}

            {/* Step 1: Warning */}
            {cancelStep === 1 && (
              <div className="mb-modal-body">
                <div className="mb-cancel-warning">
                  <div className="mb-cancel-icon">⚠️</div>
                  <h4>Are you sure you want to cancel?</h4>
                  <p>You'll lose access to all <strong>Professional</strong> features on <strong>{plan.nextBillingDate}</strong>. Your data will be preserved for 30 days.</p>
                </div>
                <div className="mb-cancel-loses">
                  <div className="mb-lose-item">✕ Unlimited Invoices</div>
                  <div className="mb-lose-item">✕ Advanced Reports</div>
                  <div className="mb-lose-item">✕ Priority Support</div>
                  <div className="mb-lose-item">✕ Payment Tracking</div>
                </div>
                <div className="mb-cancel-actions">
                  <button className="mb-btn-danger" onClick={handleCancelSubscription}>
                    Continue to Cancel
                  </button>
                  <button className="mb-btn-outline" onClick={() => setShowCancelModal(false)}>
                    Keep My Plan
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Reason */}
            {cancelStep === 2 && (
              <div className="mb-modal-body">
                <p className="mb-cancel-reason-title">Help us improve — Why are you leaving?</p>
                <div className="mb-reasons">
                  {[
                    "Too expensive",
                    "Not using it enough",
                    "Missing features I need",
                    "Switching to another tool",
                    "Technical issues",
                    "Other",
                  ].map((r) => (
                    <label key={r} className={`mb-reason-item ${cancelReason === r ? "selected" : ""}`}>
                      <input type="radio" name="reason" value={r}
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)} />
                      {r}
                    </label>
                  ))}
                </div>
                <button
                  className="mb-btn-danger"
                  onClick={handleCancelSubscription}
                  disabled={!cancelReason}
                >
                  Confirm Cancellation
                </button>
              </div>
            )}

            {/* Step 3: Done */}
            {cancelStep === 3 && (
              <div className="mb-cancel-done">
                <div className="mb-cancel-done-icon">😔</div>
                <h3>Subscription Cancelled</h3>
                <p>Your <strong>Professional</strong> plan has been cancelled. You'll retain access until <strong>{plan.nextBillingDate}</strong>.</p>
                <button className="mb-btn-primary" onClick={() => { setShowCancelModal(false); setCancelStep(1); }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ManageBilling;
