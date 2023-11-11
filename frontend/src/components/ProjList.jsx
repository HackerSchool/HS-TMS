import React, { useState } from "react";
import '../styles/Projects.css'
import MoreOptionsBtn from "./MoreOptionsBtn";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


export default function CustomProjectHolder({data, openEditModal, openDeleteModal, loading }) {
    return (
        <div className="content">
            {data.length === 0 && !loading && ( // display message when there's no data to display
                <div className="project_holder">
                    <p>No projects found</p>
                </div>
            )}
            {!loading && data.map((project) => (
                    <div className="project_holder" key={`${project.name}`}>
                        <h1>{project.name}</h1>
                        <p>{project.transaction_count} transactions</p>
                        <p>Balance: {project.balance}</p>
                        <p>{project.active ? "Active" : "Inactive"}</p>
                        <MoreOptionsBtn
                            options={[
                                {
                                    icon: <EditIcon />, 
                                    text: 'Edit', 
                                    callback: () => openEditModal(project)
                                },
                                {
                                    icon: <DeleteIcon />, 
                                    text: 'Delete', 
                                    callback: () => openDeleteModal(project)
                                }
                            ]}
                        />
                    </div>
                ))}
        </div>
    );
}