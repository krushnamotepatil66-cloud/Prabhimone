import { useEffect } from "react";
import "./DashboardLayout.css";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import { useApp } from "../context/AppContext";

function DashboardLayout({ children }) {
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } = useApp();

  useEffect(() => {
    if (sidebarMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarMobileOpen]);

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${sidebarMobileOpen ? "sidebar-mobile-open" : ""}`}>
      {/* Backdrop overlay for mobile drawer */}
      {sidebarMobileOpen && (
        <div 
          className="dashboard-sidebar-overlay" 
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;