import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  FiZap, FiStar, FiBriefcase, FiArrowRight,
  FiAlertTriangle, FiShield, FiTrendingUp
} from "react-icons/fi";
import {
  getPlanLimits,
  getDaysUntilExpiry,
  countInvoicesThisMonth,
  PLAN_LIMITS,
} from "../../utils/subscriptionLimits";
import "./PlanStatusWidget.css";

const PLAN_ICONS = {
  Free: FiShield,
  Starter: FiZap,
  Professional: FiStar,
  Enterprise: FiBriefcase,
};

function UsageBar({ label, used, limit, color }) {
  if (limit === Infinity || limit === null) {
    return (
      <div className="psw-usage-row">
        <div className="psw-usage-meta">
          <span className="psw-usage-label">{label}</span>
          <span className="psw-usage-count psw-unlimited">∞ Unlimited</span>
        </div>
        <div className="psw-bar-track">
          <div className="psw-bar-fill" style={{ width: "100%", background: "#22c55e", opacity: 0.35 }} />
        </div>
      </div>
    );
  }

  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;
  const isWarning = pct >= 80;
  const isDanger = pct >= 100;
  const barColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : color || "#6366f1";

  return (
    <div className="psw-usage-row">
      <div className="psw-usage-meta">
        <span className="psw-usage-label">{label}</span>
        <span className={`psw-usage-count ${isDanger ? "psw-danger" : isWarning ? "psw-warning" : ""}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="psw-bar-track">
        <div
          className="psw-bar-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function PlanStatusWidget() {
  const navigate = useNavigate();
  const { settings, invoices, customers, products, expenses } = useApp();

  const planName = settings?.subscriptionStatus === "cancelled" ? null : settings?.subscriptionPlan;
  const effectivePlan = planName || "free";
  const limits = getPlanLimits(planName, settings?.subscriptionStatus);
  const planMeta = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;

  const nextBillingDate = settings?.nextBillingDate || null;
  const daysLeft = getDaysUntilExpiry(nextBillingDate);

  const invoicesThisMonth = countInvoicesThisMonth(invoices);
  const customerCount = customers.length;
  const itemCount = (products || []).length;
  const expenseCount = expenses.length;

  const Icon = PLAN_ICONS[planMeta.displayName] || FiShield;

  // Expiry warning levels
  const showExpiryWarning = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const showExpiryDanger  = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <div className="psw-card">
      {/* Header */}
      <div className="psw-header">
        <div className="psw-plan-info">
          <div className="psw-plan-icon" style={{ background: `${planMeta.color}18`, color: planMeta.color }}>
            <Icon size={18} />
          </div>
          <div>
            <p className="psw-plan-label">Your Plan</p>
            <p className="psw-plan-name" style={{ color: planMeta.color }}>
              {planMeta.displayName}
            </p>
          </div>
        </div>
        <button className="psw-manage-btn" onClick={() => navigate("/dashboard/subscription")}>
          {effectivePlan === "free" ? "Upgrade" : "Manage"} <FiArrowRight size={13} />
        </button>
      </div>

      {/* ── Expiry Warning Banner ── */}
      {isExpired && (
        <div className="psw-expiry-banner psw-expired">
          <FiAlertTriangle size={15} />
          <span>Your plan has <strong>expired</strong>. Renew to restore full access.</span>
          <button onClick={() => navigate("/dashboard/subscription")}>Renew Now</button>
        </div>
      )}
      {!isExpired && showExpiryDanger && (
        <div className="psw-expiry-banner psw-danger-banner">
          <FiAlertTriangle size={15} />
          <span>Plan expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>!</span>
          <button onClick={() => navigate("/dashboard/subscription")}>Renew</button>
        </div>
      )}
      {!isExpired && !showExpiryDanger && showExpiryWarning && (
        <div className="psw-expiry-banner psw-warning-banner">
          <FiAlertTriangle size={15} />
          <span>Plan renews in <strong>{daysLeft} days</strong> on {nextBillingDate}.</span>
          <button onClick={() => navigate("/dashboard/subscription/manage")}>View</button>
        </div>
      )}

      {/* ── Next Billing Date (info) ── */}
      {!showExpiryWarning && !isExpired && nextBillingDate && (
        <div className="psw-billing-date">
          Next billing: <strong>{nextBillingDate}</strong>
        </div>
      )}

      {/* ── Usage bars ── */}
      <div className="psw-usage-section">
        <p className="psw-section-label">
          <FiTrendingUp size={13} /> Usage This Month
        </p>
        <UsageBar
          label="Invoices"
          used={invoicesThisMonth}
          limit={limits.invoicesPerMonth}
          color={planMeta.color}
        />
        <UsageBar
          label="Customers"
          used={customerCount}
          limit={limits.customers}
          color={planMeta.color}
        />
        <UsageBar
          label="Items"
          used={itemCount}
          limit={limits.items}
          color={planMeta.color}
        />
        <UsageBar
          label="Expenses"
          used={expenseCount}
          limit={limits.expenses}
          color={planMeta.color}
        />
      </div>

      {/* ── Free / No-plan CTA ── */}
      {effectivePlan === "free" && (
        <div className="psw-free-cta">
          <p>Unlock unlimited invoices, reports, purchases & more.</p>
          <button onClick={() => navigate("/dashboard/subscription")}>
            <FiZap size={14} /> View Plans
          </button>
        </div>
      )}
    </div>
  );
}

export function ShortPlanBadge() {
  const navigate = useNavigate();
  const { settings } = useApp();

  const isCancelled = settings?.subscriptionStatus === "cancelled";
  const purchasedPlan = isCancelled ? null : settings?.subscriptionPlan;
  const effectivePlan = purchasedPlan || "Free";
  const planMeta = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;

  const nextBillingDate = settings?.nextBillingDate || null;
  const daysLeft = getDaysUntilExpiry(nextBillingDate);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isWarning = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  return (
    <div className="short-plan-badge">
      <div className="short-plan-details" onClick={() => navigate("/dashboard/subscription")}>
        <span 
          className="short-plan-tag" 
          style={{ background: `${planMeta.color}15`, color: planMeta.color, borderColor: `${planMeta.color}35` }}
        >
          {effectivePlan === "Free" ? "🛡️ Free Plan" : effectivePlan === "Starter" ? "⚡ Starter Plan" : effectivePlan === "Professional" ? "⭐ Professional Plan" : "💼 Enterprise Plan"}
        </span>
        <span className="short-plan-expiry">
          {isExpired ? (
            <span className="status-badge-danger">⚠️ Expired</span>
          ) : isWarning ? (
            <span className="status-badge-warning">⚠️ Expires in {daysLeft}d</span>
          ) : nextBillingDate ? (
            <span>Renews {nextBillingDate}</span>
          ) : (
            <span>Basic Limits</span>
          )}
        </span>
      </div>
      <button 
        className="short-plan-btn" 
        onClick={() => navigate("/dashboard/subscription")}
      >
        {effectivePlan === "Free" ? "Upgrade" : "Manage"}
      </button>
    </div>
  );
}

export default PlanStatusWidget;

