import { useState } from "react";
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
  FiShoppingBag,
  FiChevronRight,
  FiX
} from "react-icons/fi";

const menu = [
  { name: "Dashboard", icon: FiGrid, path: "/dashboard" },
  {
    name: "Sales",
    icon: FiShoppingBag,
    children: [
      { name: "Invoices", icon: FiFileText, path: "/dashboard/invoices" },
      { name: "Customers", icon: FiUsers, path: "/dashboard/customers" },
      { name: "Estimates", icon: FiFileText, path: "/dashboard/estimates" },
      { name: "Credit Notes", icon: FiFileText, path: "/dashboard/credit-notes" },
      { name: "Proforma Invoices", icon: FiFileText, path: "/dashboard/proforma-invoices" },
    ],
  },
  { name: "Payments", icon: FiDollarSign, path: "/dashboard/payments" },
  { name: "Expenses", icon: FiTag, path: "/dashboard/expenses" },
  { name: "Reports", icon: FiBarChart2, path: "/dashboard/reports" },
  { name: "Settings", icon: FiSettings, path: "/dashboard/settings" },
  { name: "Profile", icon: FiUser, path: "/dashboard/profile" },
];

function Sidebar() {
  const location = useLocation();
  const {
    sidebarMobileOpen,
    setSidebarMobileOpen
  } = useApp();
  const [expandedMenus, setExpandedMenus] = useState(["Sales"]); // Sales open by default

  const handleLinkClick = () => {
    if (sidebarMobileOpen) {
      setSidebarMobileOpen(false);
    }
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((m) => m !== menuName)
        : [...prev, menuName]
    );
  };

  // Check if any child route is active
  const isChildActive = (children) => {
    return children?.some((child) => location.pathname === child.path);
  };

  return (
    <aside 
      className={`sidebar ${sidebarMobileOpen ? "mobile-open" : ""}`}
    >
      <div className="logo-section">
        <div className="logo-details">
          <span className="logo-icon">💼</span>
          <span className="logo-text">PrabhimOne</span>
        </div>
        
        {/* Close button shown on mobile drawer */}
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

          // Parent with children (e.g. Sales)
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.name);
            const hasActiveChild = isChildActive(item.children);

            return (
              <li key={item.name} className="sidebar-menu-group">
                <button
                  type="button"
                  className={`sidebar-link sidebar-parent-link ${hasActiveChild ? "parent-active" : ""}`}
                  onClick={() => toggleSubmenu(item.name)}
                >
                  <IconComponent className="link-icon" />
                  <span className="link-text">{item.name}</span>
                  <FiChevronRight className={`submenu-chevron ${isExpanded ? "rotated" : ""}`} />
                </button>

                <ul className={`sidebar-submenu ${isExpanded ? "expanded" : ""}`}>
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isActive = location.pathname === child.path;
                    return (
                      <li key={child.name}>
                        <Link
                          to={child.path}
                          className={`sidebar-link sidebar-child-link ${isActive ? "active" : ""}`}
                          onClick={handleLinkClick}
                        >
                          <ChildIcon className="link-icon child-icon" />
                          <span className="link-text">{child.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          }

          // Regular menu item
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