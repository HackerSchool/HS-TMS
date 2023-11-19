import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom"
import '../styles/Projects.css'
import axios_instance from '../Axios';
import { showErrorMsg, showSuccessMsg } from '../Alerts';
import ProjList from '../components/ProjList';
import NewProjectBtn from '../components/NewProjectBtn';
import SortButton from '../components/SortBtn';
import ProjectsFilterBtn from '../components/ProjectsFilterBtn';
import ProjectEditModal from '../components/ProjectsEditModal';
import ConfirmationModal from '../components/ConfirmationModal';


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
        axios_instance.delete(`projects/${projectToDelete.id}`)
            .then(res => {
                if (res.status === 204) {
                    showSuccessMsg("Project deleted successfully");
                    refetchProjects();
                }
                else throw new Error();
            })
            .catch(err => {
                showErrorMsg(`Couldn't delete project ${projectToDelete.name}`);
            });

        setOpenConfirmationModal(false);
    }

    function getProjectDeletionText() {
        return (
        <div style={{ lineHeight: 1.5 }}>
            <b>Name:</b> {projectToDelete.name} <br /> 
            <b># Transactions:</b> {projectToDelete.transaction_count} <br /> 
            <b>Balance:</b> {projectToDelete.balance}€ <br />
            <b>Active:</b> {projectToDelete.active ? "Yes" : "No"} <br />
            <b>Symbolic:</b> {projectToDelete.symbolic ? "Yes" : "No"}
        </div>
        )
    }

    // To show loading state while fetching transactions
    const [loading, setLoading] = useState(false);

    // To fetch projects when needed
    useEffect(() => {
        if (fetchProjects){
            setLoading(true);

            axios_instance.get("projects", {
                params: queryParams,
            })
                .then(res => {
                    if (res.status == 200) return res.data;
                    throw new Error ("Couldn't fetch projects");
                })
                .then(data => {

                    if (data.length === 0 && queryParams.size > 0)
                        showErrorMsg("No projects match the specified filters");
                    
                    setProjects(data);
                })
                .catch(err => {
                    let msg = "Couldn't fetch projects";
                    if (err.response) 
                        msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;

                    showErrorMsg(msg);
                })
                .finally(() => setLoading(false));
            
            setFetchProjects(false);
        }
    }, [fetchProjects]);

    const refetchProjects = useCallback(() => setFetchProjects(true));

    // Callback passed to the projects list componet's edit modal
    const launchEditModal = useCallback((project) => {
        setProjectToEdit(project);
        setOpenEditModal(true);
    });

    // Callback passed to the list to open a project's delete modal
    const launchConfirmationModal = useCallback((project) => {
        setProjectToDelete(project);
        setOpenConfirmationModal(true);
    });

    return (
        <section className="page" id='ProjectsPage'>
            <header>
                <h1>Projects</h1>
                <div className="btn-group left">
                    <NewProjectBtn 
                        refetch={refetchProjects} 
                    />
                </div>

                <div className="btn-group right">
                    <SortButton
                        params={queryParams}
                        setParams={setQueryParams}
                        refetch={refetchProjects}
                        options={[
                            {text: 'Name ASC', orderBy: 'name', order: 'ASC'},
                            {text: 'Name DESC', orderBy: 'name', order: 'DESC'},
                            {text: 'Balance ASC', orderBy: 'balance', order: 'ASC'},
                            {text: 'Balance DESC', orderBy: 'balance', order: 'DESC'}
                        ]}
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
                    <ProjList
                        data={projects}
                        openEditModal={launchEditModal}
                        openDeleteModal={launchConfirmationModal}
                        loading={loading}
                    />
                </div>
            </div>

            {projectToEdit && <ProjectEditModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                project={projectToEdit}
                refetch={refetchProjects}
            />}

            {projectToDelete && <ConfirmationModal
                open={openConfirmationModal}
                title={"Do you wish to permanently delete the following project?"}
                content={getProjectDeletionText()}
                onCancel={onDeleteCancelation}
                onConfirm={onDeleteConfirmation}
            />}

        </section>
    );
}

export default ProjectsPage;