import React from "react";
import "../styles/Projects.css";
import MoreOptionsBtn from "./MoreOptionsBtn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CircularProgress from "@mui/material/CircularProgress";

export default function ProjList({ data, openEditModal, openDeleteModal, loading }) {
  if (loading)
    return (
      <div style={{ margin: "0 auto", width: "fit-content" }}>
        <CircularProgress className="loading-circle large" />
      </div>
    );

  // display message when there's no data to display
  if (data.length === 0)
    return (
      <div className="no-projects-container" style={{ margin: "0 auto" }}>
        <p>No projects found</p>
      </div>
    );

  return (
    <div className="project-list">
      {data.map(project => (
        <div className="project-container" key={`${project.name}`}>
          {project.symbolic && (
            <div className="project-symbolic-indicator-container">
              <div className="project-symbolic-indicator">
                <AccountBalanceIcon />
              </div>
            </div>
          )}
          <h1>{project.name}</h1>
          <hr />
          <p>
            {project.transaction_count} transaction{project.transaction_count !== 1 ? "s" : ""}
          </p>
          <p>Balance: {project.balance.toFixed(2)}€</p>
          <p style={{ color: project.active ? "var(--hs-logo)" : "var(--light-gray)" }}>
            {project.active ? "Active" : "Inactive"}
          </p>
          <MoreOptionsBtn
            options={[
              {
                icon: <EditIcon />,
                name: "Edit",
                callback: () => openEditModal(project),
              },
              {
                icon: <DeleteIcon />,
                name: "Delete",
                callback: () => openDeleteModal(project),
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
