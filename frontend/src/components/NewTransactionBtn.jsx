import React, { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';

export default function NewTransactionBtn() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => reason != "backdropClick" ? setOpen(false) : "";

    // Form state
    const [isCost, setIsCost] = useState(true);
    const handleCostChange = (newValue) => newValue !== null ? setIsCost(newValue) : "";

    const [hasNif, setHasNif] = useState(false);
    const handleNifChange = (newValue) => newValue !== null ? setHasNif(newValue) : "";

    const formRef = useRef();

    useEffect(() => {
        window.addEventListener("formdata", submit_form);
        return window.removeEventListener("formdata", submit_form);
    }, []);

    function submit_form(event) {
        const myForm = formRef.current;
        console.log(event.formData);
        return;
    }

    return (
        <>
            <button className='btn icon-btn' id='new-transaction-btn' onClick={handleOpen}>
                <AddIcon />
                New
            </button>

            <Modal className="modal" id="new-transaction-modal" open={open} disableEnforceFocus
                onClose={(e, reason) => handleClose(reason)} >
                <form ref={formRef}>
                    <div className='form-header'>
                        <CloseIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>New Transaction</h1>
                    </div>

                    <div className="form-body">
                        <div className="form-row">
                            <div className="form-group" id='create-transaction-date-group'>
                                <label htmlFor="date">Date: *</label>
                                <input type="date" name="date" id="create-transaction-date" required />
                            </div>

                            <div className="form-group" id='create-transaction-value-group'>
                                <label htmlFor="value">Value: *</label>
                                <div className="value-cost-earning-container">
                                    <input type="number" name="value" placeholder='0' min={0} step={0.01} id="create-transaction-value" required />
                                    <ToggleButtonGroup
                                        value={isCost}
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
                            <div className="form-group" id='create-transaction-projects-group'>
                                <label htmlFor="projects">Projects:</label>
                                <input type="text" name='projects' placeholder='A/B/C' />
                            </div>
                            <div className="form-group" id='create-transaction-nif-group'>
                                <label htmlFor="nif">NIF:</label>
                                <ToggleButtonGroup
                                    value={hasNif}
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
                            <div className="form-group" id='create-transaction-description-group'>
                                <label htmlFor="description">Description:</label>
                                <input type="text" name='description' placeholder='Description of the transaction'/>
                            </div>
                            <div className="form-group" id='create-transaction-file-group'>
                                <label htmlFor="file">Receipt:</label>
                                <input type="file" name='file' />
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className="form-row last">
                        <button className="btn" id='create-transaction-btn'>Create</button>
                    </div>
                </form>
            </Modal>
        </>
    )
}