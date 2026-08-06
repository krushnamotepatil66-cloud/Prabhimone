import { useNavigate } from "react-router-dom";
import { FiZap, FiX, FiLock, FiArrowRight } from "react-icons/fi";
import "./UpgradeGate.css";

/**
 * UpgradeGate — reusable modal/banner shown when user hits a limit or a locked feature.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - title: string  (e.g. "Invoice Limit Reached")
 *  - description: string
 *  - currentPlan: string
 *  - requiredPlan: string  (plan that unlocks this feature)
 *  - usage?: { used, limit }
 *  - feature?: string  (e.g. "invoices", "purchases")
 *  - inline?: boolean  (renders as inline banner instead of modal)
 */
function UpgradeGate({
  isOpen,
  onClose,
  title,
  description,
  currentPlan = "Free",
  requiredPlan = "Professional",
  usage = null,
  inline = false,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate("/dashboard/subscription");
    if (onClose) onClose();
  };

  if (inline) {
    return (
      <div className="upgrade-gate-inline">
        <div className="ug-inline-left">
          <div className="ug-lock-icon">
            <FiLock size={18} />
          </div>
          <div className="ug-inline-text">
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </div>
        <button className="ug-upgrade-btn" onClick={handleUpgrade}>
          <FiZap size={14} /> Upgrade to {requiredPlan} <FiArrowRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="upgrade-gate-overlay" onClick={onClose}>
      <div className="upgrade-gate-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        {onClose && (
          <button className="ug-close-btn" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        )}

        {/* Icon */}
        <div className="ug-icon-circle">
          <FiLock size={28} />
        </div>

        {/* Content */}
        <h2 className="ug-title">{title}</h2>
        <p className="ug-description">{description}</p>

        {/* Usage bar */}
        {usage && (
          <div className="ug-usage-wrap">
            <div className="ug-usage-label">
              <span>Used</span>
              <span>{usage.used} / {usage.limit}</span>
            </div>
            <div className="ug-usage-bar">
              <div
                className="ug-usage-fill"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Plan comparison */}
        <div className="ug-plan-row">
          <div className="ug-plan-chip current">
            <span className="plan-chip-label">Current</span>
            <span className="plan-chip-name">{currentPlan}</span>
          </div>
          <FiArrowRight className="ug-arrow" />
          <div className="ug-plan-chip required">
            <span className="plan-chip-label">Unlock with</span>
            <span className="plan-chip-name">{requiredPlan}</span>
          </div>
        </div>

        {/* CTA */}
        <button className="ug-upgrade-btn-large" onClick={handleUpgrade}>
          <FiZap size={16} /> Upgrade to {requiredPlan}
        </button>

        {onClose && (
          <button className="ug-dismiss-btn" onClick={onClose}>
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}

export default UpgradeGate;
