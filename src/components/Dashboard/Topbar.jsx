import { useState } from "react";
import "./Topbar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { FiSettings, FiMenu, FiArrowLeft } from "react-icons/fi";

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, activities, markAllActivitiesAsRead, setSidebarMobileOpen } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/dashboard/invoices":
        return "Invoices";
      case "/dashboard/customers":
        return "Customers";
      case "/dashboard/estimates":
        return "Estimates & Quotations";
      case "/dashboard/credit-notes":
        return "Credit Notes";
      case "/dashboard/proforma-invoices":
        return "Proforma Invoices";
      case "/dashboard/payments":
        return "Payments Received";
      case "/dashboard/expenses":
        return "Expenses";
      case "/dashboard/reports":
        return "Reports";
      case "/dashboard/settings":
        return "Settings";
      case "/dashboard/profile":
        return "My Profile";
      default:
        return "PrabhimOne";
    }
  };

  const unreadCount = activities.filter((act) => !act.read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setSidebarMobileOpen(true)}
          title="Open Menu"
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        {location.pathname !== "/dashboard" && (
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
            aria-label="Go back"
          >
            <FiArrowLeft />
          </button>
        )}
        <h3 className="topbar-title">{getPageTitle(location.pathname)}</h3>
      </div>

      <div className="topbar-right">


        {/* Notifications Bell with Badge */}
        <div className="topbar-notifications-container">
          <button
            className={`topbar-action-btn ${showNotifications ? "active-btn" : ""}`}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <>
              {/* Clicking outside closes the list panel */}
              <div
                className="notifications-overlay-trigger"
                onClick={() => setShowNotifications(false)}
              />
              
              <div className="notifications-dropdown">
                <div className="notifications-dropdown-header">
                  <h4>Recent Updates</h4>
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-btn"
                      onClick={() => {
                        markAllActivitiesAsRead();
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {activities.length === 0 ? (
                    <div className="no-notifications">No activity logs recorded.</div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act.id}
                        className={`notification-item ${!act.read ? "unread" : ""}`}
                      >
                        <span className="dot-indicator" />
                        <div className="notification-content">
                          <p className="notification-text">{act.text}</p>
                          <span className="notification-time">{act.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="topbar-divider" />
        
        {/* User Card - Clickable settings navigate */}
        <div
          className="topbar-user"
          title={`${profile.name} - ${profile.role} (View Profile)`}
          onClick={() => navigate("/dashboard/profile")}
        >
          <span className="user-avatar">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              profile.avatar || "👤"
            )}
          </span>
          <span className="user-name">{profile.name}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;