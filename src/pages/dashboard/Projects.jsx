import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreateProjectForm from "../../components/DashboardHome/CreateProjectForm";
import "./Projects.css";

function Projects() {
  const { projects, addProject, deleteProject } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Monitor Query Parameters for redirects (?action=new)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDelete = (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete project "${name}"?`);
    if (confirmDelete) {
      deleteProject(id);
    }
  };

  const handleSaveProject = (projectData) => {
    addProject(projectData);
    setIsCreating(false);
  };

  const filteredProjects = projects.filter((proj) => {
    const matchSearch =
      proj.name.toLowerCase().includes(search.toLowerCase()) ||
      proj.customer.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "All" || proj.status === filter;

    return matchSearch && matchFilter;
  });

  if (isCreating) {
    return (
      <DashboardLayout>
        <CreateProjectForm
          onSave={handleSaveProject}
          onCancel={() => setIsCreating(false)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="projects-page">
        {/* Header Block */}
        <div className="projects-header">
          <div>
            <h1>Projects</h1>
            <p className="subtitle">Track tasks, log timesheets, and manage client hourly rates.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-bar-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search projects or clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button className="primary-btn add-project-btn" onClick={() => setIsCreating(true)}>
              + New Project
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <button
            className={`filter-btn ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "Active" ? "active" : ""}`}
            onClick={() => setFilter("Active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === "Finished" ? "active" : ""}`}
            onClick={() => setFilter("Finished")}
          >
            Finished
          </button>
        </div>

        {/* Projects List Table */}
        <div className="table-card">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Customer / Client</th>
                <th>Hours Logged</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr key={proj.id}>
                    <td className="project-id-cell">{proj.id}</td>
                    <td className="project-name-cell">{proj.name}</td>
                    <td>{proj.customer}</td>
                    <td style={{ fontWeight: "600", color: "#475569" }}>
                      ⏱️ {proj.hours} Hrs
                    </td>
                    <td>
                      <span className={`status-badge badge-${proj.status.toLowerCase()}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="delete-icon-btn"
                        onClick={() => handleDelete(proj.id, proj.name)}
                        title="Delete Project"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Projects;
