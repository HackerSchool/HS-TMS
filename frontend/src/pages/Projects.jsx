import React from "react";
import "../App.css";
import "../styles/Projects.css";

import "../components/Sidebar";
import Sidebar from "../components/Sidebar";

import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

function ProjectsPage() {
  return (
    <div className="page">
      <Sidebar />
      <div className="content">
        <div className="head">
          <div className=".head_l">
            <div className="title">
              Projects
            </div>
            <button className="buttons">
              <AddIcon/>
              New
            </button>
          </div>
          <div className=".head_r">
            <button className="buttons">Sorted by: Active First</button>
            <div className="title"></div>
            <button className="buttons">Filter</button>
          </div>
        </div>
        <div className="list_holder">
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          <div className="project_holder">
            <h1>Arquimidia</h1>
            <p>6 transactions</p>
            <p>Balance: -10</p>
            <p>Active</p>
            <button id = 'edit_proj'><ModeEditIcon/></button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
