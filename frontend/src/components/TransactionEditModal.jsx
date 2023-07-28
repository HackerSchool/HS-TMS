import React, { useState, useEffect, useRef } from 'react';
import axios_instance from '../Axios'
import MultipleSelect from './MultipleSelect';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';

function TransactionEditModal({ open, setOpen, transaction, refetch }) {

    const handleClose = (reason) => {
        if (editedTransaction) refetch();
        setOpen(false)
    };

    function reset() {
        setErrorMsg("");
        setSuccessMsg("");
        // Update the form data everytime the transaction being edited changes
        setFormData({
            date: transaction.date,
            value: Math.abs(transaction.value),
            isCost: transaction.value < 0 ? true : false,
            projects: transaction.projects !== null
                    ? transaction.projects.split("/").map((name, index, array) => {
                        if (array.length === 1) return name;
                        if (index === 0) return name.substring(0, name.length - 1);
                        if (index === array.length - 1) return name.substring(1);
                        return name.substring(1, name.length - 1);
                    })
                    : [],
            hasNif: transaction.has_nif,
            description: transaction.description
        })
    }
    
    // refs
    const formRef = useRef();

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // to know whether it's necessary to refetch transactions or not
    const [editedTransaction, setEditedTransaction] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        date: transaction.date,
        value: Math.abs(transaction.value),
        isCost: transaction.value < 0 ? true : false,
        projects: transaction.projects !== null
                ? transaction.projects.split("/").map((name, index, array) => {
                    if (array.length === 1) return name;
                    if (index === 0) return name.substring(0, name.length - 1);
                    if (index === array.length - 1) return name.substring(1);
                    return name.substring(1, name.length - 1);
                })
                : [],
        hasNif: transaction.has_nif,
        description: transaction.description
    })

    // Handle form changes
    function handleChange(e) {
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
        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                isCost: newValue
            }));
    }

    function handleNifChange(newValue) {
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

        const form = formRef.current;

        // check form requirements
        if (!form.reportValidity()) return;

        const body = new FormData();

        body.append("date", formData.date);
        body.append("value", formData.isCost ? formData.value * -1 : formData.value);
        body.append("projects", JSON.stringify(getChosenProjectsIds()));
        body.append("hasNif", formData.hasNif);
        body.append("description", formData.description);
        // the receipt can't be changed so just send back the hasFile flag
        body.append("hasFile", transaction.has_file)

        console.log(Array.from(body.entries()))

        setLoading(true);

        axios_instance.put(`transactions/${transaction.id}`, body, {
            headers: {
                'Content-Type': "multipart/form-data"
            }
        })
            .then(res => {
                console.log(res)
                if (res.status == 200) {
                    setSuccessMsg("Transaction updated successfully");
                    setEditedTransaction(true)
                }
                else throw new Error();
            })
            .catch(err => {
                console.log(err)
                setErrorMsg("Couldn't update Transaction");
            })
            .finally(() => setLoading(false));

    }

    // Projects to choose
    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => {
        // Fetch projects on first open
        if (projectsList.length == 0 && open) { // FIXME
            console.log("fetching projects...");

            axios_instance.get("projects")
                .then(res => {
                    if (res.status == 200) return res.data;
                    throw new Error("Couldn't fetch projects");
                })
                .then(data => {
                    setProjectsList(data);
                    console.log(data) 
                })
                .catch(err => console.log(err));
        }

        // Reset form data
        if (open) reset();

    }, [open])

    function getChosenProjectsIds() {
        return formData.projects.map((value) => {
            return projectsList.find(el => el.name == value)?.id;
        })
    }

    function handleProjectsChange(event) {
        const value = event.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            // On autofill we get a stringified value.
            projects: typeof value === 'string' ? value.split(',') : value,
        }));
    };


    return (
        <Modal
            className="modal transaction-modal"
            id="edit-transaction-modal"
            open={open}
            disableEnforceFocus
            onClose={(e, reason) => handleClose(reason)}
            closeAfterTransition 
            slotProps={{ backdrop: { timeout: 500 } }}
        >
            <Grow in={open} easing={{ exit: "ease-in" }} >
            <Box className="box transaction-box" >
            <form className={`${loading ? "loading" : ""}`} encType='multipart/form-data' ref={formRef} id='edit-transaction-form' onSubmit={submitForm}>
                {errorMsg && <Alert className="edit-transaction-alert" onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>}
                {successMsg && <Alert className="edit-transaction-alert" onClose={() => setSuccessMsg("")} severity="success">{successMsg}</Alert>}

                <div className='form-header'>
                    <CloseIcon className='modal-close-btn' onClick={handleClose} />
                    <h1>Edit Transaction {transaction.id}</h1>
                </div>

                <div className="form-body">
                    <div className="form-row">
                        <div className="form-group transaction-date-group" id='edit-transaction-date-group'>
                            <label htmlFor="date">Date: *</label>
                            <input type="date" name="date" className='transaction-date' id="edit-transaction-date" required
                                value={formData.date} onChange={handleChange} />
                        </div>

                        <div className="form-group transaction-value-group" id='edit-transaction-value-group'>
                            <label htmlFor="value">Value: *</label>
                            <div className="value-cost-earning-container">
                                <input type="number" name="value" placeholder='0' min={0} step={0.01}
                                    className='transaction-value' id="edit-transaction-value" required
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
                        <div className="form-group transaction-projects-group" id='edit-transaction-projects-group'>
                            <label htmlFor="projects">Projects:</label>
                            <MultipleSelect
                                options={projectsList}
                                selectedOptions={formData.projects}
                                handleChange={handleProjectsChange}
                            />


                        </div>
                        <div className="form-group transaction-nif-group" id='edit-transaction-nif-group'>
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
                        <div className="form-group transaction-description-group" id='edit-transaction-description-group'>
                            <label htmlFor="description">Description:</label>
                            <input type="text" name='description' placeholder='Description of the transaction'
                                value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="form-group transaction-file-group" id='edit-transaction-file-group'>
                            <label htmlFor="file">Has receipt:</label>
                            <div className={`toggle-button left right ${transaction.has_file ? "active" : ""}`}>
                                {transaction.has_file ? <CheckIcon /> : <CloseIcon />}
                                {transaction.has_file ? "Yes" : "No"}
                            </div>
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
    );
}

export default TransactionEditModal;