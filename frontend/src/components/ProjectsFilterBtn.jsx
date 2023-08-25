import React, { useState, useEffect } from 'react';
import axios_instance from '../Axios';
import TuneIcon from '@mui/icons-material/Tune';
import MultipleSelect from './MultipleSelect';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';

function ProjectsFilterBtn({ params, setParams, refetch }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
            setErrorMsg("");
            setOpen(false);
    }

    console.log(Array.from(params.entries()))

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");

    const defaultFilters = {
        initialValue: "",
        finalValue: "",
        active: "any",
    }

    const [formData, setFormData] = useState({
        initialValue: params.get("initialValue") ?? "",
        finalValue: params.get("finalValue") ?? "",
        active: params.get("active") ?? "any",
    })

    console.log(formData)

    // Handle form changes
    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            [name]: value
        }))
    }

    function handleActiveChange(newValue) {
        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                active: newValue
            }));
    }

    function clearFilters(event) {
        event.preventDefault();
        setFormData(defaultFilters);
    }

    function updateFilters(event) {
        // stop all the default form submission behaviour
        event.preventDefault();

        // Check values
        if (formData.initialValue && formData.finalValue &&
            (parseFloat(formData.initialValue) > parseFloat(formData.finalValue))) {
            setErrorMsg("Max value can't be lower than the Min value")
            return;
        }


        console.log(getChosenProjectsIds(formData.projects), formData.projects)

        let filters = [];

        if (formData.initialValue != "") filters.push(["initialValue", formData.initialValue]);
        if (formData.finalValue != "") filters.push(["finalValue", formData.finalValue]);
        if (formData.active != "any") filters.push(["active", formData.hasNif]);

        let queryParams = {};

        for (const el of filters) {
            queryParams = {
                ...queryParams,
                [el[0]]: el[1]
            }
        }

        console.log(queryParams)

        setParams(oldParams => {
            if (oldParams.get("orderBy") && oldParams.get("order")) {
                queryParams = {
                    ...queryParams,
                    "orderBy": oldParams.get("orderBy"),
                    "order": oldParams.get("order")
                }
            }

            return queryParams;
        });
        refetch();
        setErrorMsg("");
        setOpen(false);
    }



    return (
        <>
            <button className="btn icon-btn" id='projects-filter-btn' onClick={handleOpen} >
                <TuneIcon />
                Filter
            </button>

            <Modal
                className="modal"
                id="projects-filter-modal"
                open={open}
                disableEnforceFocus
                onClose={(e, reason) => handleClose(reason)}
                closeAfterTransition 
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Slide in={open} direction='left' >
                <Box className="box filters-box" >
                <form id='projects-filter-form' onSubmit={updateFilters}>
                    {errorMsg && <Alert className="projects-filter-alert" onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>}

                    <div className='form-header'>
                        <ArrowBackIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>Filters</h1>
                    </div>

                    <div className="form-body">

                        <div className="form-row">
                            <div className="form-group" id='projects-filter-initial-value-group'>
                                <div className="projects-filter-label-group">
                                    <label htmlFor="value" className='projects-filter-value-label'>Min value:</label>
                                    <span className='value-help'>(?)</span>
                                </div>
                                <input className='projects-filter-value' type="number" name="initialValue"
                                    placeholder='0' step={0.01} id="projects-filter-initial-value"
                                    value={formData.initialValue} onChange={handleChange} />
                            </div>

                            <div className="form-group" id='projects-filter-final-value-group'>
                                <div className="projects-filter-label-group">
                                    <label htmlFor="value" className='projects-filter-value-label'>Max value:</label>
                                    <span className='value-help'>(?)</span>
                                </div>
                                <input className='projects-filter-value' type="number" name="finalValue"
                                    placeholder='0' step={0.01} id="projects-filter-final-value"
                                    value={formData.finalValue} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" id='projects-filter-active-group'>
                                <label htmlFor="active">Active:</label>
                                <ToggleButtonGroup
                                    value={formData.active}
                                    exclusive
                                    onChange={(e, value) => handleActiveChange(value)}
                                    id='projects-filter-active-buttons'
                                >
                                    <ToggleButton className='toggle-button left' value={"false"}>
                                        <CloseIcon />
                                        No
                                    </ToggleButton>
                                    <ToggleButton className='toggle-button' value={"any"}>
                                        Any
                                    </ToggleButton>
                                    <ToggleButton className='toggle-button right' value={"true"}>
                                        <CheckIcon />
                                        Yes
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </div>
                    </div>

                    <hr />
                    <div className="form-row last">
                        <button className="btn" id='transactions-filter-clear-btn' onClick={clearFilters} >
                            Clear
                        </button>
                        <button type='submit' className="btn" id='transactions-filter-save-btn' >
                            Save
                        </button>
                    </div>
                </form>
                </Box>
                </Slide>
            </Modal>
        </>
    );
}

export default ProjectsFilterBtn;