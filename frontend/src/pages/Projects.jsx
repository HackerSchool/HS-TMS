import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom"
import axios_instance from '../Axios';
import '../styles/Projects.css'
import ProjList from '../components/ProjList';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Alert from '@mui/material/Alert';
import NewProjectBtn from '../components/NewProjectBtn';
import ProjectsFilterBtn from '../components/ProjectsFilterBtn';
//import ProjectsSortButton from '../components/ProjectsSortBtn';
//import ProjectsFilterBtn from '../components/ProjectsFilterBtn';
//import ProjectEditModal from '../components/ProjectEditModal';


function ProjectsPage() {

    const [projects, setProjects] = useState([]);
    const [fetchProjects, setFetchProjects] = useState(true);
    const [queryParams, setQueryParams] = useSearchParams();

        // Project Edit Modal
        const [openEditModal, setOpenEditModal] = useState(false);
        const [projectToEdit, setProjectToEdit] = useState();

    //Alerts to dsiplay
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (fetchProjects){
            axios_instance.get("projects", {
                params: queryParams,
            })
                .then(res => {
                    console.log(res);
                    if(res.status == 200) return res.data;
                    throw new Error ("Couldn't fetch projects")
                })
                .then(data => {

                    if (data.length === 0 && queryParams.size > 0)
                        setErrorMsg("No projects match the specified filters");
                    else
                        setErrorMsg("");
                    
                        setProjects(data)
                })
                .catch(err => console.log(err));
            
                setFetchProjects(false);
        }
    }, [fetchProjects]);

    const refetchProjects = useCallback(() => setFetchProjects(true));

    const launchEditModal = useCallback((project) => {
        setProjectToEdit(project);
        setOpenEditModal(true);
    });

    return (
        <section className="page" id='ProjectsPage'>
            {errorMsg && <Alert className="projects-alert" onClose={() => { setErrorMsg("") }} severity="error">{errorMsg}</Alert>}

            <header>
                <h1>Projects</h1>
                <div className="btn-group left">
                    <NewProjectBtn refetch={refetchProjects} />
                </div>

                <div className="btn-group right">
                    <button className='btn icon-btn' id='sorted-by'>
                        <SortIcon />
                        Sorted by: Most Recent
                    </button>

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
                        refetch={refetchProjects}
                        openEditModal={launchEditModal}
                    />
                </div>
            </div>
        </section>
    );
}

export default ProjectsPage;