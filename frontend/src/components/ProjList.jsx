import React from "react";
import '../styles/Projects.css'
import MoreOptionsBtn from "./MoreOptionsBtn";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function ProjList({ data, openEditModal, openDeleteModal, loading }) {
    return (
        <div className="project-list">
            {data.length === 0 && !loading && ( // display message when there's no data to display
                <div className="project-container">
                    <p>No projects found</p>
                </div>
            )}
            {!loading && data.map((project) => (
                    <div className="project-container" key={`${project.name}`}>
                        {project.default && <div className="project-default-indicator-container">
                            <div className="project-default-indicator">
                                <AccountBalanceIcon />
                            </div>
                        </div>}
                        <h1>{project.name}</h1>
                        <hr />
                        <p>{project.transaction_count} transactions</p>
                        <p>Balance: {project.balance.toFixed(2)}€</p>
                        <p style={{ color: project.active ? "var(--hs-logo)" : "var(--light-gray)" }}>
                            {project.active ? "Active" : "Inactive"}
                        </p>
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