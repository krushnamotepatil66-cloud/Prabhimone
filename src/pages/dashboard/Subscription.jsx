import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import { FiCheck, FiZap, FiBriefcase, FiStar, FiArrowRight, FiShield, FiGift } from "react-icons/fi";
import "./Subscription.css";

const plans = [
  {
    name: "Starter",
    icon: FiZap,
    price: 49,
    period: "/month",
    color: "blue",
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
    color: "indigo",
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
    color: "slate",
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

const billingCycle = ["Monthly", "Yearly"];

function Subscription() {
  const navigate = useNavigate();
  const { settings } = useApp();
  const isCancelled = settings?.subscriptionStatus === "cancelled";
  const purchasedPlan = isCancelled ? null : settings?.subscriptionPlan;
  
  const [billing, setBilling] = useState("Monthly");
  const [activePlan, setActivePlan] = useState(purchasedPlan || null);

  const handleSelectPlan = (plan) => {
    if (plan.contactSales) {
      // For Enterprise, just highlight the card (no payment page)
      setActivePlan(plan.name);
      return;
    }
    // Redirect to the payment/checkout page with plan + billing in query params
    navigate(`/dashboard/subscription/payment?plan=${encodeURIComponent(plan.name)}&billing=${billing}`);
  };

  const getPrice = (plan) => {
    if (!plan.price) return "Custom";
    const p = billing === "Yearly" ? Math.round(plan.price * 10) : plan.price;
    return `₹${p}`;
  };

  const getPeriod = (plan) => {
    if (!plan.price) return "";
    return billing === "Yearly" ? "/year" : "/month";
  };

  const getSavings = (plan) => {
    if (!plan.price) return null;
    return billing === "Yearly" ? `Save ₹${plan.price * 2}` : null;
  };

  // Banner is only shown if there is an active purchased plan
  const showBanner = purchasedPlan && !isCancelled;

  return (
    <DashboardLayout>
      <div className="sub-page">

        {/* ── Header ── */}
        <div className="sub-header">
          <div className="sub-header-text">
            <h1>Subscription & Plans</h1>
            <p>Choose the plan that works best for you. Upgrade or downgrade anytime.</p>
          </div>
          <div className="sub-billing-toggle">
            {billingCycle.map((cycle) => (
              <button
                key={cycle}
                className={`billing-tab ${billing === cycle ? "active" : ""}`}
                onClick={() => setBilling(cycle)}
              >
                {cycle}
                {cycle === "Yearly" && <span className="yearly-save-tag">Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Current Plan Banner ── */}
        {showBanner && (
          <div className="sub-current-plan-banner">
            <div className="current-plan-left">
              <FiShield size={20} />
              <div>
                <p className="current-plan-label">Your Current Plan</p>
                <p className="current-plan-name">{purchasedPlan} — {billing}</p>
              </div>
            </div>
            <button className="sub-manage-btn" onClick={() => navigate("/dashboard/subscription/manage")}>Manage Billing <FiArrowRight size={14} /></button>
          </div>
        )}

        {/* ── Plan Cards ── */}
        <div className="sub-plans-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = activePlan === plan.name;
            const savings = getSavings(plan);

            return (
              <div
                key={plan.name}
                className={`sub-plan-card color-${plan.color} ${plan.featured ? "featured" : ""} ${isActive ? "is-active" : ""}`}
              >
                {plan.featured && (
                  <div className="most-popular-badge">⭐ Most Popular</div>
                )}
                {isActive && (
                  <div className="active-plan-ribbon">Current Plan</div>
                )}

                <div className="sub-plan-icon-wrap color-${plan.color}">
                  <Icon size={22} />
                </div>

                <h3 className="sub-plan-name">{plan.name}</h3>
                <p className="sub-plan-desc">{plan.description}</p>

                <div className="sub-plan-price-row">
                  <span className="sub-plan-price">{getPrice(plan)}</span>
                  <span className="sub-plan-period">{getPeriod(plan)}</span>
                </div>
                {savings && <div className="sub-savings-tag">{savings} with yearly billing</div>}

                <ul className="sub-features-list">
                  {plan.features.map((f) => (
                    <li key={f} className="feature-row available">
                      <span className="feature-check"><FiCheck size={13} /></span>
                      {f}
                    </li>
                  ))}
                  {plan.unavailable.map((f) => (
                    <li key={f} className="feature-row unavailable">
                      <span className="feature-dash">–</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.trialBadge && !isActive && (
                  <div className="sub-trial-tag">
                    <FiGift size={12} /> 7-day free trial
                  </div>
                )}

                <button
                  className={`sub-plan-btn ${isActive ? "btn-active" : plan.featured ? "btn-featured" : "btn-default"}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isActive ? "✓ Current Plan" : plan.button}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── FAQ / Trust Strip ── */}
        <div className="sub-trust-strip">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔄</span>
            <span>Cancel Anytime</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📞</span>
            <span>24/7 Support</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✅</span>
            <span>No Hidden Fees</span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Subscription;
