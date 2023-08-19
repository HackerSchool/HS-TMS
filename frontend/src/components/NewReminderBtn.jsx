import React, { useState, useEffect, useRef } from 'react';
import axios_instance from '../Axios'
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';


function NewReminderBtn({ refetch }) {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
        if (loading) return;
        
        setOpen(false)
    };

    function reset() {
        setFormData({
            date: "",
            title: "",
            description: ""
        })
    }

    // Refs
    const formRef = useRef();

    // Form state
    const [formData, setFormData] = useState({
        date: "",
        title: "",
        description: ""
    })

    // Handle form changes
    function handleChange(e) {
        if (loading) return;

        const name = e.target.name;
        const value = e.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            [name]: value
        }))
    }

    const [loading, setLoading] = useState(false)

    // Create formData and send it to the backend
    function submitForm(event) {
        // stop all the default form submission behaviour
        event.preventDefault();

        // to remove the focus highlight while this fn is running
        document.activeElement.blur();

        if (loading) return;

        const form = formRef.current;

        // check form requirements
        if (!form.reportValidity()) return;

        const body = new FormData();

        body.append("date", formData.date);
        body.append("title", formData.title);
        body.append("description", formData.description);

        setLoading(true);

        axios_instance.post("reminders", body, {
            headers: {
                'Content-Type': "multipart/form-data"
            }
        })
            .then(res => {
                if (res.status === 201) {
                    // showSuccessMsg("Reminder created successfully"); FIXME
                    refetch();
                }
                else throw new Error();
            })
            .catch(err => {
                let msg = "Couldn't create reminder"
                if (err.response) msg += `. Status code: ${err.response.status}`;

                // showErrorMsg(msg); FIXME
            })
            .finally(() => {
                setLoading(false);
                setOpen(false);
            });

    }

    // Reset form data
    useEffect(() => {
        if (open) reset();

    }, [open])

    return (
        <>
            <div onClick={handleOpen} style={{ cursor: 'pointer' }}>
                <NotificationAddIcon />
            </div>

            <Modal
                className="modal reminder-modal"
                id="new-reminder-modal"
                open={open}
                disableRestoreFocus
                onClose={(e, reason) => handleClose(reason)}
                closeAfterTransition 
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Grow in={open} easing={{ exit: "ease-in" }}>
                <Box className="box reminder-box">
                <form encType='multipart/form-data' ref={formRef} id='create-reminder-form' onSubmit={submitForm}>

                    <div className='form-header'>
                        <CloseIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>New Reminder</h1>
                    </div>

                    <div className="form-body">
                        <div className="form-row reminder-date-title-row">
                            <div className="form-group reminder-date-group" id='create-reminder-date-group'>
                                <label htmlFor="date">Date: *</label>
                                <input type="date" name="date" className='reminder-date' id="create-reminder-date"
                                    value={formData.date} onChange={handleChange} required />
                            </div>

                            <div className="form-group reminder-title-group" id='create-reminder-title-group'>
                                <label htmlFor="title">Title: *</label>
                                <input type="text" name="title" className='reminder-title' id="create-reminder-title"
                                    value={formData.title} onChange={handleChange}
                                    placeholder='Title of the reminder' required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group reminder-description-group" id='create-reminder-description-group'>
                                <label htmlFor="description">Description:</label>
                                <input type="text" name='description' placeholder='Description of the reminder'
                                    value={formData.description} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className="form-row last">
                        <button type='submit' className={`btn submit-btn ${loading && "icon-btn"}`} id='create-reminder-btn' >
                            {loading && <CircularProgress className='loading-circle' />}
                            {loading ? "Creating" : "Create"}
                        </button>
                    </div>
                </form>
                </Box>
                </Grow>
            </Modal>
        </>
    );
}

export default NewReminderBtn;