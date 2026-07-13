import { useApp } from "../../context/AppContext";
import "./WidgetStyles.css";

function ProjectsWidget() {
  const { projects } = useApp();

  return (
    <div className="zoho-card" style={{ maxHeight: "390px" }}>
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Projects</h4>
      </div>

      <div className="zoho-list">
        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <div key={proj.id} className="zoho-list-item">
              <div className="item-left">
                <span className="item-name">{proj.name}</span>
                <span className="item-desc">{proj.customer}</span>
              </div>
              <div className="item-right">
                <span className="item-badge badge-active">{proj.status}</span>
                <span className="item-metric">{proj.hours} Hrs Logged</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
            No active projects.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsWidget;
