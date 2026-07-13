import { useApp } from "../../context/AppContext";
import "./Activity.css";

function Activity() {
  const { activities } = useApp();

  return (
    <div className="activity">
      <h3>Recent Activity</h3>

      <ul>
        {activities.length === 0 ? (
          <li style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>
            No recent activity.
          </li>
        ) : (
          activities.map((item) => (
            <li key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✓ {item.text}</span>
                <span style={{ fontSize: "12px", color: "#888" }}>{item.time}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Activity;