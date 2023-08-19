import React, { useState, useEffect } from 'react';
import FadingAlert from './FadingAlert';
import TuneIcon from '@mui/icons-material/Tune';
import MultipleSelect from './MultipleSelect';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';

function TransactionsFilterBtn({ params, setParams, refetch, projectsList }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
        setDisplayErrorMsg(false);

        setOpen(false);
    }

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");
    const [displayErrorMsg, setDisplayErrorMsg] = useState(false);
    const [alertId, setAlertId] = useState(0);

    const defaultFilters = {
        initialMonth: "",
        finalMonth: "",
        initialValue: "",
        finalValue: "",
        projects: [],
        hasNif: "any",
        hasFile: "any",
    }

    const [formData, setFormData] = useState({
        initialMonth: params.get("initialMonth") ?? "",
        finalMonth: params.get("finalMonth") ?? "",
        initialValue: params.get("initialValue") ?? "",
        finalValue: params.get("finalValue") ?? "",
        projects: [],
        hasNif: params.get("hasNif") ?? "any",
        hasFile: params.get("hasFile") ?? "any",
    })

    // Handle form changes
    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            [name]: value
        }))
    }

    function handleNifChange(newValue) {
        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                hasNif: newValue
            }));
    }

    function handleHasFileChange(newValue) {
        // so there's always a button selected
        if (newValue !== null)
            setFormData((oldFormData) => ({
                ...oldFormData,
                hasFile: newValue
            }));
    }

    function clearFilters(event) {
        event.preventDefault();
        setFormData(defaultFilters);
    }

    function updateFilters(event) {
        // stop all the default form submission behaviour
        event.preventDefault();

        // Check date
        if (formData.initialMonth && formData.finalMonth &&
            (formData.initialMonth > formData.finalMonth)) {
            setAlertId(oldId => oldId + 1);
            setErrorMsg("Final month can't precede Initial month");
            setDisplayErrorMsg(true);
            return;
        }

        // Check values
        if (formData.initialValue && formData.finalValue &&
            (parseFloat(formData.initialValue) > parseFloat(formData.finalValue))) {
            setAlertId(oldId => oldId + 1);
            setErrorMsg("Max value can't be lower than the Min value");
            setDisplayErrorMsg(true);
            return;
        }

        let filters = [];

        if (formData.initialMonth != "") filters.push(["initialMonth", formData.initialMonth]);
        if (formData.finalMonth != "") filters.push(["finalMonth", formData.finalMonth]);
        if (formData.initialValue != "") filters.push(["initialValue", formData.initialValue]);
        if (formData.finalValue != "") filters.push(["finalValue", formData.finalValue]);
        if (formData.hasNif != "any") filters.push(["hasNif", formData.hasNif]);
        if (formData.hasFile != "any") filters.push(["hasFile", formData.hasFile]);
        if (formData.projects.length > 0) filters.push(["projects", `[${getChosenProjectsIds(formData.projects)}]`]);

        let queryParams = {};

        for (const el of filters) {
            queryParams = {
                ...queryParams,
                [el[0]]: el[1]
            }
        }

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
        setDisplayErrorMsg(false);
        setAlertId(0);
        setOpen(false);
    }

    // In case the URL params have project IDs specified, we need to translate
    // the IDs to their corresponding names
    useEffect(() => {
        const chosenProjectsIds = JSON.parse(params.get("projects")) ?? [];
        if (chosenProjectsIds.length > 0) {
            setFormData((oldFormData) => ({
                ...oldFormData,
                projects: getChosenProjectsNames(chosenProjectsIds) ?? []
            }))
        }
    }, [projectsList]);

    function getChosenProjectsNames(chosenProjectsIds) {
        return chosenProjectsIds.map((value) => {
            return projectsList.find(el => el.id == value)?.name;
        })
    }

    function getChosenProjectsIds(chosenProjects) {
        return chosenProjects.map((value) => {
            return projectsList.find(el => el.name == value)?.id;
        })
    }

    function handleProjectsChange(event) {
        const value = event.target.value;

        setFormData((oldFormData) => ({
            ...oldFormData,
            // On autofill we get a stringified value.
            projects: typeof value === 'string' ? value.split(',') : value
        }));
    }



    return (
        <>
            <button className="btn icon-btn" id='transactions-filter-btn' onClick={handleOpen} >
                <TuneIcon />
                Filter
            </button>

            <Modal
                className="modal"
                id="transactions-filter-modal"
                open={open}
                disableRestoreFocus
                onClose={(e, reason) => handleClose(reason)}
                closeAfterTransition 
                slotProps={{ backdrop: { timeout: 500 } }}
            >
                <Slide in={open} direction='left' >
                <Box className="box filters-box" >
                <form id='transactions-filter-form' onSubmit={updateFilters}>

                    <FadingAlert show={displayErrorMsg} className="transactions-filter-alert" id={alertId}
                            onClose={() => setDisplayErrorMsg(false)} severity="error" >
                        {errorMsg}
                    </FadingAlert>

                    <div className='form-header'>
                        <ArrowBackIcon className='modal-close-btn' onClick={handleClose} />
                        <h1>Filters</h1>
                    </div>

                    <div className="form-body">
                        <div className="form-row">
                            <div className="form-group" id='transactions-filter-initial-month-group'>
                                <label htmlFor="date">Initial month:</label>
                                <input type="month" name="initialMonth" id="transactions-filter-initial-month"
                                    value={formData.initialMonth} onChange={handleChange} />
                            </div>

                            <div className="form-group" id='transactions-filter-final-month-group'>
                                <label htmlFor="date">Final month:</label>
                                <input type="month" name="finalMonth" id="transactions-filter-final-month"
                                    value={formData.finalMonth} onChange={handleChange} />
                            </div>

                        </div>

                        <div className="form-row">
                            <div className="form-group" id='transactions-filter-initial-value-group'>
                                <div className="transactions-filter-label-group">
                                    <label htmlFor="value" className='transactions-filter-value-label'>Min value:</label>
                                    <span className='value-help'>(?)</span>
                                </div>
                                <input className='transactions-filter-value' type="number" name="initialValue"
                                    placeholder='0' step={0.01} id="transactions-filter-initial-value"
                                    value={formData.initialValue} onChange={handleChange} />
                            </div>

                            <div className="form-group" id='transactions-filter-final-value-group'>
                                <div className="transactions-filter-label-group">
                                    <label htmlFor="value" className='transactions-filter-value-label'>Max value:</label>
                                    <span className='value-help'>(?)</span>
                                </div>
                                <input className='transactions-filter-value' type="number" name="finalValue"
                                    placeholder='0' step={0.01} id="transactions-filter-final-value"
                                    value={formData.finalValue} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" id='transactions-filter-nif-group'>
                                <label htmlFor="nif">Has NIF:</label>
                                <ToggleButtonGroup
                                    value={formData.hasNif}
                                    exclusive
                                    onChange={(e, value) => handleNifChange(value)}
                                    id='transactions-filter-nif-buttons'
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

                            <div className="form-group" id="transactions-filter-file-group">
                                <label htmlFor="file">Has receipt:</label>
                                <ToggleButtonGroup
                                    value={formData.hasFile}
                                    exclusive
                                    onChange={(e, value) => handleHasFileChange(value)}
                                    id='transactions-filter-nif-buttons'
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

                        <div className="form-row">
                            <div className="form-group" id='transactions-filter-projects-group'>
                                <label htmlFor="projects">Projects:</label>
                                <MultipleSelect
                                    options={projectsList}
                                    selectedOptions={formData.projects}
                                    handleChange={handleProjectsChange}
                                />
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

export default TransactionsFilterBtn;