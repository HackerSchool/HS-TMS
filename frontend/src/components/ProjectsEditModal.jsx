import React, { useState, useEffect, useRef } from 'react';
import axios_instance from '../Axios'
import MultipleSelect from './MultipleSelect';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';

function ProjectEditModal({ open, setOpen, project, refetch }) {

    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
        if (editedProject) refetch();
        setOpen(false)
    };

    function reset() {
        setErrorMsg("");
        setSuccessMsg("");
        // Update the form data everytime the Project being edited changes
        setFormData({
            active: project.active,
        })
    }
    
    // refs
    const formRef = useRef();
    const fileRef = useRef();

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // to know whether it's necessary to refetch transactions or not
    const [editedProject, setEditedProject] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        active: project.active,
    })

    function handleActiveChange(newValue) {
        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                active: newValue
            }));
    }


    const [loading, setLoading] = useState(false)

    // Create formData and send it to the backend
    function submitForm(event) {
        // stop all the default form submission behaviour
        event.preventDefault();

        const form = formRef.current;

        // check form requirements
        if (!form.reportValidity()) return;

        const body = new FormData();

        body.append("active", formData.active);

        console.log(Array.from(body.entries()))

        setLoading(true);

        axios_instance.put(`projects/${project.name}`, body, {
            headers: {
                'Content-Type': "multipart/form-data"
            }
        })
            .then(res => {
                console.log(res)
                if (res.status == 200) {
                    setSuccessMsg("Project updated successfully");
                    setEditedProject(true)
                }
                else throw new Error();
            })
            .catch(err => {
                console.log(err)
                setErrorMsg("Couldn't update Project");
            })
            .finally(() => setLoading(false));

    }

    return (
        <>
            <button className="btn icon-btn" id='projects-edit-btn' onClick={handleOpen} >
                    <ModeEditIcon />
            </button>


            <Modal
                className="modal project-modal"
                id="edit-project-modal"
                open={open}
                disableEnforceFocus
                onClose={(e, reason) => handleClose(reason)}
                closeAfterProject 
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Grow in={open} easing={{ exit: "ease-in" }} >
                <Box className="box project-box" >
                <form className={`${loading ? "loading" : ""}`} encType='multipart/form-data' ref={formRef} id='edit-project-form' onSubmit={submitForm}>
                    {errorMsg && <Alert className="edit-project-alert" onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>}
                    {successMsg && <Alert className="edit-project-alert" onClose={() => setSuccessMsg("")} severity="success">{successMsg}</Alert>}

                    <div className='form-header'>
                        <CloseIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>{project.name}</h1>
                    </div>

                    <div className="form-body">
                        <div className="form-row">
                            <div className="form-group project-active-group" id='edit-project-active-group'>
                                <label htmlFor="active">Active:</label>
                                <ToggleButtonGroup
                                    value={formData.active}
                                    exclusive
                                    onChange={(e, value) => handleActiveChange(value)}
                                >
                                    <ToggleButton className='toggle-button left' value={false}>
                                        <CloseIcon />
                                        No
                                    </ToggleButton>
                                    <ToggleButton className='toggle-button right' value={true}>
                                        <CheckIcon />
                                        Yes
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className="form-row last">
                        <button type='submit' className="btn transaction-submit-btn" id='edit-transaction-btn' >
                            Save
                        </button>
                    </div>
                </form>
                </Box>
                </Grow>
            </Modal>
        </>
    );
}

export default ProjectEditModal;