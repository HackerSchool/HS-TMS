import React, { useState } from "react";
import '../styles/Projects.css'
import ModeEditIcon from '@mui/icons-material/ModeEdit';


function createData(name, ntransactions, balance, state) {
    return { name, ntransactions, balance, state };
}

const projects = [
    createData('Arquimedia', 6, -15, true),
    createData('Rocky', 5, -26, true),
    createData('HS Table', 7, -22, true),
    createData('HS Minibot', 2, -15, true),
    createData('Levitação Magnética', 1, -18, false),
    createData('HSTMS', 0, -23, true),
    createData('Turing', 7, -24, true),
    createData('Headset', 4, -63, false),
    createData('Gameboy Emulator', 5, -48, true),
    createData('GD Simulator', 11, -30, true),
    createData('Arquimedia12', 3, -36, false),
    createData('Arquimedia13', 9, -15, true),
    createData('Arquimedia14', 0, 0, true),
    createData('Arquimedia15', 8, -70, true),
    createData('Arquimedia16', 5, -10, true),
    createData('Arquimedia17', 13, -50, false),
    createData('Arquimedia18', 5, -15, true),
    createData('Arquimedia19', 6, -65, true),
    createData('Arquimedia20', 8, -54, false),
];


export default function CustomProjectHolder() {
    return (
        <div className="content">
            {projects.map((project) => (
                    <div className="project_holder" key={`${project.name}`}>
                        <h1>{project.name}</h1>
                        <p>{project.ntransactions} transactions</p>
                        <p>Balance: {project.balance}</p>
                        <p>{project.state ? "Active" : "Inactive"}</p>
                        <button id = 'edit_button'><ModeEditIcon /></button>
                    </div>
                ))}
        </div>
    );
}