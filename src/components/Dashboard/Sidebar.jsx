import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  FiGrid,
  FiFileText,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from "react-icons/fi";

const menu = [
  { name: "Dashboard", icon: FiGrid, path: "/dashboard" },
  { name: "Invoices", icon: FiFileText, path: "/dashboard/invoices" },
  { name: "Customers", icon: FiUsers, path: "/dashboard/customers" },
  { name: "Payments", icon: FiDollarSign, path: "/dashboard/payments" },
  { name: "Expenses", icon: FiTag, path: "/dashboard/expenses" },
  { name: "Projects", icon: FiClock, path: "/dashboard/projects" },
  { name: "Reports", icon: FiBarChart2, path: "/dashboard/reports" },
  { name: "Settings", icon: FiSettings, path: "/dashboard/settings" },
  { name: "Profile", icon: FiUser, path: "/dashboard/profile" },
];

function Sidebar() {
  const location = useLocation();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen
  } = useApp();

  const handleLinkClick = () => {
    if (sidebarMobileOpen) {
      setSidebarMobileOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${sidebarMobileOpen ? "mobile-open" : ""}`}>
      <div className="logo-section">
        <div className="logo-details">
          <span className="logo-icon">💼</span>
          <span className="logo-text">InvoicePro</span>
        </div>
        
        {/* Toggle button for desktop, Close button for mobile drawer */}
        <button 
          className="sidebar-toggle-btn desktop-only"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <button 
          className="sidebar-close-btn mobile-only"
          onClick={() => setSidebarMobileOpen(false)}
          title="Close Sidebar"
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
      </div>

      <ul className="sidebar-menu">
        {menu.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.name}>
              <Link 
                to={item.path} 
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <IconComponent className="link-icon" />
                <span className="link-text">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default Sidebar;