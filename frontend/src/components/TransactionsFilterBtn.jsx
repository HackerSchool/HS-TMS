import React, { useState, useEffect } from 'react';
import axios_instance from '../Axios';
import TuneIcon from '@mui/icons-material/Tune';
import MultipleSelect from './MultipleSelect';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';

function TransactionsFilterBtn({ params, setParams, refetch }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = (reason) => {
        if (reason != "backdropClick") {
            setErrorMsg("");
            setOpen(false);
        }
    }

    console.log(Array.from(params.entries()))

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");

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
            setErrorMsg("Final month can't precede Initial month")
            return;
        }

        // Check values
        if (formData.initialValue && formData.finalValue &&
            (parseFloat(formData.initialValue) > parseFloat(formData.finalValue))) {
            setErrorMsg("Max value can't be lower than the Min value")
            return;
        }


        console.log(getChosenProjectsIds(formData.projects), formData.projects)

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

        console.log(queryParams)

        setParams(queryParams);
        refetch();
        setErrorMsg("");
        setOpen(false);
    }


    // Projects to choose
    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => {
        if (projectsList.length == 0 && open) {
            console.log("fetching projects...");

            axios_instance.get("projects")
                .then(res => {
                    if (res.status == 200) return res.data;
                    throw new Error("Couldn't fetch projects");
                })
                .then(data => {
                    setProjectsList(data);
                    console.log(data);

                    const chosenProjectsIds = JSON.parse(params.get("projects")) ?? [];
                    if (chosenProjectsIds.length > 0) {
                        setFormData((oldFormData) => ({
                            ...oldFormData,
                            projects: getChosenProjectsNames(chosenProjectsIds, data) ?? []
                        }))
                    }
                })
                .catch(err => console.log(err));
        }
    }, [open])

    function getChosenProjectsNames(chosenProjectsIds, allProjects) {
        return chosenProjectsIds.map((value) => {
            return allProjects.find(el => el.id == value)?.name;
        })
    }

    function getChosenProjectsIds(chosenProjects) {
        return chosenProjects.map((value) => {
            return projectsList.find(el => el.name == value)?.id;
        })
    }

    function handleProjectsChange(event) {
        const value = event.target.value;
        console.log(typeof value);

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

            <Modal className="modal" id="transactions-filter-modal" open={open} disableEnforceFocus
                onClose={(e, reason) => handleClose(reason)} >
                <form id='transactions-filter-form' onSubmit={updateFilters}>
                    {errorMsg && <Alert className="transactions-filter-alert" onClose={() => { setErrorMsg("") }} severity="error">{errorMsg}</Alert>}

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
            </Modal>
        </>
    );
}

export default TransactionsFilterBtn;