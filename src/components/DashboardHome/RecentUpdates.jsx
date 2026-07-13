import { useApp } from "../../context/AppContext";
import "./WidgetStyles.css";

function RecentUpdates() {
  const { activities } = useApp();

  return (
    <div className="zoho-card" style={{ maxHeight: "390px" }}>
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Recent Updates</h4>
      </div>

      <div className="zoho-list">
        {activities && activities.length > 0 ? (
          activities.map((act) => (
            <div key={act.id} className="zoho-list-item" style={{ borderLeft: "3px solid #1b75bb", paddingLeft: "15px" }}>
              <div className="item-left">
                <span className="item-name" style={{ fontWeight: "normal", color: "#374151" }}>{act.text}</span>
                <span className="item-desc" style={{ fontSize: "11px" }}>{act.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
            No recent updates.
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentUpdates;
