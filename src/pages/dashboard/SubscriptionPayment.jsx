import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  FiCheck, FiLock, FiArrowLeft, FiCalendar,
  FiShield, FiGift, FiZap, FiAlertCircle
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import "./SubscriptionPayment.css";

// ─── RAZORPAY CONFIG ──────────────────────────────────────────
const RAZORPAY_KEY_ID = "rzp_test_TM5suysvhc76GI";
// NOTE: Secret key is NEVER placed here (frontend) — only Key ID is safe client-side

const PLANS = {
  Starter: {
    name: "Starter",
    price: { Monthly: 49, Yearly: 490 },
    color: "#3b82f6",
    features: ["5 Invoices / Month", "2 Users", "Email Support", "Basic Dashboard", "PDF Export"],
  },
  Professional: {
    name: "Professional",
    price: { Monthly: 99, Yearly: 990 },
    color: "#6366f1",
    featured: true,
    features: [
      "Unlimited Invoices", "Unlimited Users", "Advanced Reports",
      "Payment Tracking", "Priority Support", "GST & Tax Reports", "PDF & Excel Export",
    ],
  },
  Enterprise: {
    name: "Enterprise",
    price: { Monthly: 149, Yearly: 1490 },
    color: "#64748b",
    features: [
      "Everything Included", "Dedicated Account Manager", "Custom Integrations",
      "API Access", "24/7 Priority Support", "SLA Guarantee", "Custom Branding",
    ],
  },
};

// Load Razorpay checkout.js SDK dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function SubscriptionPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planName = searchParams.get("plan") || "Professional";
  const billing  = searchParams.get("billing") || "Monthly";
  const plan     = PLANS[planName] || PLANS.Professional;

  const { settings, updateSettings } = useApp();

  const [sdkReady,    setSdkReady]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [paymentId,   setPaymentId]   = useState(null);
  const [rzpError,    setRzpError]    = useState(null);
  const razorpayRef = useRef(null);

  // Compute trial end date (7 days from today)
  const today    = new Date();
  const trialEnd = new Date(today);
  trialEnd.setDate(today.getDate() + 7);
  const trialEndStr = trialEnd.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const price      = plan.price[billing];
  const isEnterprise = price === null;
  // Razorpay expects amount in paise (₹1 = 100 paise)
  const amountPaise = price ? price * 100 : 0;

  // Load Razorpay SDK on mount
  useEffect(() => {
    loadRazorpayScript().then((ok) => {
      setSdkReady(ok);
      if (!ok) setRzpError("Failed to load Razorpay SDK. Check your internet connection.");
    });
    return () => {
      // Cleanup: close any open Razorpay modal on unmount
      if (razorpayRef.current) {
        try { razorpayRef.current.close(); } catch (_) {}
      }
    };
  }, []);

  // Called when Razorpay payment succeeds
  const handlePaymentSuccess = (response) => {
    const pid = response.razorpay_payment_id;
    setPaymentId(pid);

    if (updateSettings && settings) {
      const newHistoryItem = {
        id: pid || `RZP-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: price,
        status: "Paid",
        plan: `${plan.name} – ${billing}`,
        description: "Subscription payment via Razorpay",
        razorpayPaymentId: pid,
      };

      // Compute next billing date
      const startDate = new Date();
      const nextBilling = new Date(startDate);
      if (billing === "Yearly") {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      } else {
        nextBilling.setDate(nextBilling.getDate() + 30);
      }
      const nextBillingDateStr = nextBilling.toISOString().split("T")[0];

      const currentHistory = settings.billingHistory || [];
      updateSettings({
        ...settings,
        subscriptionPlan: plan.name,
        subscriptionStatus: "active",
        subscriptionBilling: billing,
        subscriptionStartDate: startDate.toISOString().split("T")[0],
        nextBillingDate: nextBillingDateStr,
        billingHistory: [newHistoryItem, ...currentHistory],
        savedPaymentMethod: {
          type: "razorpay",
          paymentId: pid,
        },
      });
    }
    setLoading(false);
    setSuccess(true);
  };

  // Open Razorpay checkout
  const handlePayWithRazorpay = async () => {
    if (!sdkReady) {
      setRzpError("Razorpay SDK is still loading. Please try again.");
      return;
    }
    setRzpError(null);
    setLoading(true);

    const prefillName  = settings?.businessName || settings?.name || "";
    const prefillEmail = settings?.email || "";

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: "INR",
      name: "PrabhimOne",
      description: `${plan.name} Plan – ${billing} Subscription`,
      // No order_id needed for test/demo mode
      image: "https://i.ibb.co/placeholder/logo.png", // optional logo
      prefill: {
        name:    prefillName,
        email:   prefillEmail,
        contact: settings?.phone || "",
      },
      notes: {
        plan:    plan.name,
        billing: billing,
        trial:   "7-day free trial",
      },
      theme: {
        color: "#7c3aed",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setRzpError("Payment was cancelled. You can try again.");
        },
        animation: true,
        backdropclose: false,
      },
      handler: handlePaymentSuccess,
    };

    try {
      const rzp = new window.Razorpay(options);
      razorpayRef.current = rzp;

      rzp.on("payment.failed", (response) => {
        setLoading(false);
        setRzpError(
          `Payment failed: ${response.error?.description || "Unknown error"}. Please try again.`
        );
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      setRzpError(`Could not open Razorpay: ${err.message}`);
    }
  };

  // ─── SUCCESS SCREEN ───────────────────────────────────────────
  if (success) {
    return (
      <DashboardLayout>
        <div className="sp-success-screen">
          <div className="sp-success-card rzp-success-card">
            <div className="rzp-success-badge">
              <div className="rzp-success-ring" />
              <span className="rzp-success-emoji">🎉</span>
            </div>
            <h2>Payment Successful!</h2>
            <p className="sp-success-sub">
              Your <strong>{plan.name}</strong> plan is now active with a{" "}
              <strong>7-day free trial</strong>. No charges until{" "}
              <strong>{trialEndStr}</strong>.
            </p>

            {paymentId && (
              <div className="rzp-payment-id-box">
                <span className="rzp-pid-label">Razorpay Payment ID</span>
                <code className="rzp-pid-value">{paymentId}</code>
              </div>
            )}

            <div className="sp-trial-badge">
              <FiGift size={16} /> Free Trial Active — Ends {trialEndStr}
            </div>

            <div className="rzp-success-actions">
              <button
                className="sp-goto-dash-btn"
                onClick={() => navigate("/dashboard/subscription")}
              >
                Go to Subscription →
              </button>
              <button
                className="rzp-goto-manage-btn"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── PAYMENT PAGE ─────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="sp-page">
        {/* Back */}
        <button className="sp-back-btn" onClick={() => navigate("/dashboard/subscription")}>
          <FiArrowLeft size={16} /> Back to Plans
        </button>

        <div className="sp-layout">
          {/* ── LEFT: Order Summary ── */}
          <div className="sp-summary-panel">
            <div className="sp-trial-banner">
              <FiGift size={18} />
              <div>
                <strong>7-Day Free Trial Included</strong>
                <p>No charge until {trialEndStr}. Cancel anytime before then.</p>
              </div>
            </div>

            <div className="sp-plan-summary-card">
              <div className="sp-plan-color-bar" style={{ background: plan.color }} />
              <div className="sp-plan-summary-body">
                <div className="sp-plan-summary-header">
                  <h3>{plan.name}</h3>
                  <span className="sp-billing-badge">{billing}</span>
                </div>

                {isEnterprise ? (
                  <div className="sp-plan-price-display">
                    <span className="sp-price-big">Custom</span>
                  </div>
                ) : (
                  <div className="sp-plan-price-display">
                    <span className="sp-price-big">₹{price}</span>
                    <span className="sp-price-period">/{billing === "Monthly" ? "month" : "year"}</span>
                  </div>
                )}

                <ul className="sp-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className="sp-feature-check"><FiCheck size={11} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Billing Timeline */}
            {!isEnterprise && (
              <div className="sp-billing-timeline">
                <div className="sp-timeline-item today">
                  <div className="sp-tl-dot" />
                  <div>
                    <span className="sp-tl-label">Today</span>
                    <span className="sp-tl-val">Free trial starts — ₹0 charged</span>
                  </div>
                </div>
                <div className="sp-timeline-line" />
                <div className="sp-timeline-item charge">
                  <div className="sp-tl-dot charge" />
                  <div>
                    <span className="sp-tl-label">{trialEndStr}</span>
                    <span className="sp-tl-val">₹{price} charged — plan begins</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust items */}
            <div className="sp-trust-row">
              <span><FiLock size={13} /> SSL Encrypted</span>
              <span><FiShield size={13} /> Secure Payment</span>
              <span><FiCalendar size={13} /> Cancel Anytime</span>
            </div>
          </div>

          {/* ── RIGHT: Razorpay Payment Panel ── */}
          <div className="sp-form-panel rzp-panel">

            {/* Razorpay Header */}
            <div className="rzp-header">
              <div className="rzp-logo-row">
                <img
                  src="https://razorpay.com/favicon.ico"
                  alt="Razorpay"
                  className="rzp-favicon"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span className="rzp-powered-by">Powered by <strong>Razorpay</strong></span>
                <span className="rzp-test-badge">TEST MODE</span>
              </div>
              <h2 className="sp-form-title">Complete Payment</h2>
              <p className="sp-form-subtitle">
                Your card will <strong>not</strong> be charged until after your 7-day free trial.
              </p>
            </div>

            {/* Order Summary Box */}
            {!isEnterprise && (
              <div className="rzp-order-box">
                <div className="rzp-order-row">
                  <span>{plan.name} Plan ({billing})</span>
                  <span>₹{price}</span>
                </div>
                <div className="rzp-order-row">
                  <span>7-Day Free Trial</span>
                  <span className="rzp-free-tag">FREE</span>
                </div>
                <div className="rzp-order-divider" />
                <div className="rzp-order-row rzp-total-row">
                  <span>Due Today</span>
                  <span className="rzp-due-amount">₹0.00</span>
                </div>
                <div className="rzp-order-row rzp-after-trial">
                  <span>After trial ({trialEndStr})</span>
                  <span>₹{price}/{billing === "Monthly" ? "mo" : "yr"}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {rzpError && (
              <div className="rzp-error-banner">
                <FiAlertCircle size={15} />
                <span>{rzpError}</span>
              </div>
            )}

            {/* Pay Button */}
            {!isEnterprise ? (
              <button
                className={`rzp-pay-btn ${loading ? "loading" : ""} ${!sdkReady ? "disabled" : ""}`}
                onClick={handlePayWithRazorpay}
                disabled={loading || !sdkReady}
              >
                {loading ? (
                  <>
                    <span className="sp-spinner" />
                    Opening Razorpay…
                  </>
                ) : !sdkReady ? (
                  <>
                    <span className="sp-spinner" />
                    Loading Payment Gateway…
                  </>
                ) : (
                  <>
                    <FiZap size={17} />
                    Pay with Razorpay — Start Free Trial
                  </>
                )}
              </button>
            ) : (
              <button
                className="rzp-pay-btn"
                onClick={() => navigate("/dashboard/subscription")}
              >
                Contact Sales Team
              </button>
            )}

            {/* Test Mode Card Info */}
            <div className="rzp-test-info-card">
              <div className="rzp-test-info-header">
                <FiShield size={14} />
                <span>Test Mode — Domestic Indian Test Cards</span>
              </div>
              <div className="rzp-domestic-note">
                🇮🇳 Use <strong>domestic cards only</strong> — international cards are disabled on test accounts by default.
              </div>

              {/* Visa Test Card */}
              <div className="rzp-card-option-block">
                <div className="rzp-card-option-label">Visa (Domestic)</div>
                <div className="rzp-test-credentials">
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">Card Number</span>
                    <code className="rzp-cred-val">4208 5288 0343 0095</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">Expiry</span>
                    <code className="rzp-cred-val">02/35</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">CVV</span>
                    <code className="rzp-cred-val">111</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">OTP / 3DS</span>
                    <code className="rzp-cred-val">1234</code>
                  </div>
                </div>
              </div>

              {/* Mastercard Test Card */}
              <div className="rzp-card-divider" />
              <div className="rzp-card-option-block">
                <div className="rzp-card-option-label">Mastercard (Domestic)</div>
                <div className="rzp-test-credentials">
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">Card Number</span>
                    <code className="rzp-cred-val">5267 3181 8797 5449</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">Expiry</span>
                    <code className="rzp-cred-val">06/35</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">CVV</span>
                    <code className="rzp-cred-val">123</code>
                  </div>
                  <div className="rzp-cred-row">
                    <span className="rzp-cred-label">OTP / 3DS</span>
                    <code className="rzp-cred-val">1234</code>
                  </div>
                </div>
              </div>
            </div>

            <p className="sp-no-charge-note">
              🔒 No charge today. Cancel before {trialEndStr} to avoid billing.
            </p>

            {/* Razorpay logos/trust */}
            <div className="rzp-trust-logos">
              <span>🔒 256-bit SSL</span>
              <span>🛡️ PCI DSS Compliant</span>
              <span>✅ RBI Regulated</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionPayment;
