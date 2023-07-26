import React from 'react';
import '../styles/Projects.css'
import ProjList from '../components/ProjList';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

function ProjectsPage() {
    return (
        <section className="page" id='ProjectsPage'>
            <header>
                <h1>Projects</h1>
                <div className="btn-group left">
                    <button className='btn icon-btn'>
                        <AddIcon />
                        New
                    </button>
                </div>
                <div className="btn-group right">
                    <button className='btn icon-btn' id='sorted-by'>
                        <SortIcon />
                        Sorted by: Most Recent
                    </button>
                    <button className='btn icon-btn' id='filter'>
                        <TuneIcon />
                        Filter
                    </button>
                </div>
            </header>

            <div className="content-container">
                <div className="content">
                    <ProjList/>
                </div>
            </div>
        </section>
    );
}

export default ProjectsPage;