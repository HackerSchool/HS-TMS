import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Projects.css";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg, showWarningMsg } from "../Alerts";
import ProjectsTable from "../components/ProjectsTable";
import NewProjectBtn from "../components/NewProjectBtn";
import SortButton from "../components/SortBtn";
import ProjectsFilterBtn from "../components/ProjectsFilterBtn";
import ProjectEditModal from "../components/ProjectsEditModal";
import ConfirmationModal from "../components/ConfirmationModal";

const sortOptions = [
  { name: "Name ASC", orderBy: "name", order: "ASC" },
  { name: "Name DESC", orderBy: "name", order: "DESC" },
  { name: "Balance ASC", orderBy: "balance", order: "ASC" },
  { name: "Balance DESC", orderBy: "balance", order: "DESC" },
];

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [fetchProjects, setFetchProjects] = useState(true);
  const [queryParams, setQueryParams] = useSearchParams();

  // Project Edit Modal
  const [openEditModal, setOpenEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState();

  // Project Deletion
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState();

  function onDeleteCancelation() {
    setOpenConfirmationModal(false);
  }

  function onDeleteConfirmation() {
    axios_instance
      .delete(`projects/${projectToDelete.id}`)
      .then(res => {
        if (res.status === 204) {
          showSuccessMsg("Project deleted successfully");
          refetchProjects();
        } else throw new Error();
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = `Couldn't delete project ${projectToDelete.name}`;
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response) {
          const status = String(err.response.status);
          if (status.startsWith("4")) {
            msg += ". Bad client request";
          } else if (status.startsWith("5")) {
            msg += ". Internal server error";
            refetchProjects();
          }
        }

        showErrorMsg(msg);
      });

    setOpenConfirmationModal(false);
  }

  function getProjectDeletionText() {
    return (
      <div style={{ lineHeight: 1.5 }}>
        <b>Name:</b> {projectToDelete.name} <br />
        <b>Transactions:</b> {projectToDelete.transaction_count} <br />
        <b>Balance:</b> {projectToDelete.balance.toFixed(2)}€ <br />
        <b>Active:</b> {projectToDelete.active ? "Yes" : "No"} <br />
        <b>Symbolic:</b> {projectToDelete.symbolic ? "Yes" : "No"}
      </div>
    );
  }

  // To show loading state while fetching projects
  const [loading, setLoading] = useState(false);

  // To fetch projects when needed
  useEffect(() => {
    if (fetchProjects) {
      setLoading(true);

      axios_instance
        .get("projects", {
          params: queryParams,
        })
        .then(res => {
          if (res.status == 200) return res.data;
          throw new Error("Couldn't fetch projects");
        })
        .then(data => {
          if (
            data.length === 0 &&
            queryParams.size > 0 &&
            !(queryParams.size === 2 && queryParams.get("orderBy") && queryParams.get("order"))
          )
            showWarningMsg("No projects match the specified filters");

          setProjects(data);
        })
        .catch(err => {
          if (err.handledByMiddleware) return;

          let msg = "Couldn't fetch projects";
          if (err.reqTimedOut) msg += ". Request timed out";
          else if (err.response)
            msg += `. ${("" + err.response.status)[0] === "4" ? "Bad client request" : "Internal server error"}`;

          showErrorMsg(msg);
        })
        .finally(() => setLoading(false));

      setFetchProjects(false);
    }
  }, [fetchProjects]);

  const refetchProjects = useCallback(() => setFetchProjects(true));

  // Callback passed to the projects list componet's edit modal
  const launchEditModal = useCallback(project => {
    setProjectToEdit(project);
    setOpenEditModal(true);
  });

  // Callback passed to the list to open a project's delete modal
  const launchConfirmationModal = useCallback(project => {
    setProjectToDelete(project);
    setOpenConfirmationModal(true);
  });

  return (
    <section className="page" id="ProjectsPage">
      <header>
        <h1>Projects</h1>
        <div className="btn-group left">
          <NewProjectBtn refetch={refetchProjects} />
        </div>

        <div className="btn-group right">
          <SortButton
            params={queryParams}
            setParams={setQueryParams}
            refetch={refetchProjects}
            options={sortOptions}
            loading={loading}
          />

          <ProjectsFilterBtn
            params={queryParams}
            setParams={setQueryParams}
            refetch={refetchProjects}
          />
        </div>
      </header>

      <div className="content-container">
        <div className="content">
          <ProjectsTable
            data={projects}
            openEditModal={launchEditModal}
            openDeleteModal={launchConfirmationModal}
            loading={loading}
          />
        </div>
      </div>

      {projectToEdit && (
        <ProjectEditModal
          open={openEditModal}
          setOpen={setOpenEditModal}
          project={projectToEdit}
          refetch={refetchProjects}
        />
      )}

      {projectToDelete && (
        <ConfirmationModal
          open={openConfirmationModal}
          title={"Do you wish to permanently delete the following project?"}
          content={getProjectDeletionText()}
          onCancel={onDeleteCancelation}
          onConfirm={onDeleteConfirmation}
        />
      )}
    </section>
  );
}

export default ProjectsPage;
