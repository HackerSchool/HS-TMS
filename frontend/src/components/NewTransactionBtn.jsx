import React, { useState, useEffect, useRef } from 'react';
import axios_instance from '../Axios'
import MultipleSelect from './MultipleSelect';
import FadingAlert from './FadingAlert';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import CircularProgress from '@mui/material/CircularProgress';

export default function NewTransactionBtn({ refetch, projectsList, showErrorMsg, showSuccessMsg }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
        if (loading) return;
        
        setOpen(false)
    };

    function reset() {
        setFormData({
            date: "",
            value: "",
            isCost: true,
            projects: [],
            hasNif: false,
            description: ""
        })
        setErrorMsg("");
        setDisplayErrorMsg(false);
    }
    
    // refs
    const formRef = useRef();
    const fileRef = useRef();

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");
    const [displayErrorMsg, setDisplayErrorMsg] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        date: "",
        value: "",
        isCost: true,
        projects: [],
        hasNif: false,
        description: ""
    })

    // Handle form changes
    function handleChange(e) {
        if (loading) return;

        const name = e.target.name;
        const value = e.target.value;

        // Negative values are not allowed
        if (name == "value" && value < 0) return;

        setFormData((oldFormData) => ({
            ...oldFormData,
            [name]: value
        }))
    }

    function handleCostChange(newValue) {
        if (loading) return;

        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                isCost: newValue
            }));
    }

    function handleNifChange(newValue) {
        if (loading) return;

        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                hasNif: newValue
            }));
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

        // guarantee the receipt is a pdf
        if (fileRef.current.files[0] && fileRef.current.files[0].type !== "application/pdf") {
            setErrorMsg("Receipt's file type needs to be \"pdf\"");
            setDisplayErrorMsg(true);
            return;
        }

        const body = new FormData();

        body.append("date", formData.date);
        body.append("value", formData.isCost ? formData.value * -1 : formData.value);
        body.append("projects", JSON.stringify(getChosenProjectsIds()));
        body.append("hasNif", formData.hasNif);
        body.append("description", formData.description);
        body.append("receipt", fileRef.current.files[0]);

        setLoading(true);

        axios_instance.post("transactions", body, {
            headers: {
                'Content-Type': "multipart/form-data"
            }
        })
            .then(res => {
                if (res.status === 201) {
                    showSuccessMsg("Transaction created successfully");
                    refetch();
                }
                else throw new Error();
            })
            .catch(err => {
                let msg = "Couldn't create transaction"
                if (err.response) msg += `. Status code: ${err.response.status}`;

                showErrorMsg(msg);
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

    function getChosenProjectsIds() {
        return formData.projects.map((value) => {
            return projectsList.find(el => el.name == value)?.id;
        })
    }

    function handleProjectsChange(event) {
        if (loading) return;

        const value = event.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            // On autofill we get a stringified value.
            projects: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    return (
        <>
            <button className='btn icon-btn' id='new-transaction-btn' onClick={handleOpen}>
                <AddIcon />
                New
            </button>

            <Modal
                className="modal transaction-modal"
                id="new-transaction-modal"
                open={open}
                disableRestoreFocus
                onClose={(e, reason) => handleClose(reason)}
                closeAfterTransition 
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Grow in={open} easing={{ exit: "ease-in" }}>
                <Box className="box transaction-box">
                <form encType='multipart/form-data' ref={formRef} id='create-transaction-form' onSubmit={submitForm}>

                    <FadingAlert show={displayErrorMsg} className="create-transaction-alert"
                            onClose={() => setDisplayErrorMsg(false)} severity="error">
                        {errorMsg}
                    </FadingAlert>

                    <div className='form-header'>
                        <CloseIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>New Transaction</h1>
                    </div>

                    <div className="form-body">
                        <div className="form-row">
                            <div className="form-group transaction-date-group" id='create-transaction-date-group'>
                                <label htmlFor="date">Date: *</label>
                                <input type="date" name="date" className='transaction-date' id="create-transaction-date" required
                                    value={formData.date} onChange={handleChange} />
                            </div>

                            <div className="form-group transaction-value-group" id='create-transaction-value-group'>
                                <label htmlFor="value">Value: *</label>
                                <div className="value-cost-earning-container">
                                    <input type="number" name="value" placeholder='0' min={0} step={0.01}
                                        className='transaction-value' id="create-transaction-value" required
                                        value={formData.value} onChange={handleChange} />
                                    <ToggleButtonGroup
                                        value={formData.isCost}
                                        exclusive
                                        onChange={(e, value) => handleCostChange(value)}
                                    >
                                        <ToggleButton className='toggle-button left' value={true}>
                                            <RemoveIcon />
                                            Cost
                                        </ToggleButton>
                                        <ToggleButton className='toggle-button right' value={false}>
                                            <AddIcon />
                                            Earning
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group transaction-projects-group" id='create-transaction-projects-group'>
                                <label htmlFor="projects">Projects:</label>
                                <MultipleSelect
                                    options={projectsList}
                                    selectedOptions={formData.projects}
                                    handleChange={handleProjectsChange}
                                />


                            </div>
                            <div className="form-group transaction-nif-group" id='create-transaction-nif-group'>
                                <label htmlFor="nif">NIF:</label>
                                <ToggleButtonGroup
                                    value={formData.hasNif}
                                    exclusive
                                    onChange={(e, value) => handleNifChange(value)}
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

                        <div className="form-row">
                            <div className="form-group transaction-description-group" id='create-transaction-description-group'>
                                <label htmlFor="description">Description:</label>
                                <input type="text" name='description' placeholder='Description of the transaction'
                                    value={formData.description} onChange={handleChange} />
                            </div>
                            <div className="form-group transaction-file-group" id='create-transaction-file-group'>
                                <label htmlFor="file">Receipt:</label>
                                <input type="file" name='receipt' accept='.pdf' ref={fileRef} />
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className="form-row last">
                        <button type='submit' className={`btn transaction-submit-btn ${loading && "icon-btn"}`} id='create-transaction-btn' >
                            {loading && <CircularProgress className='loading-circle' />}
                            {loading ? "Creating" : "Create"}
                        </button>
                    </div>
                </form>
                </Box>
                </Grow>
            </Modal>
        </>
    )
}