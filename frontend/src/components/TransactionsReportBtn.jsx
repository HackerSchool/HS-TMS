import React, { useState, useEffect, useRef, useMemo } from "react";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg } from "../Alerts";
import Modal from "@mui/material/Modal";
import SelectDropdown from "./SelectDropdown";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import CircularProgress from "@mui/material/CircularProgress";
import SummarizeIcon from "@mui/icons-material/Summarize";

function TransactionsReportBtn({ params, projectsList, sortOptions }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = reason => {
    if (loading) return;

    setOpen(false);
  };

  function reset() {
    // In case the URL params have project IDs specified, we need to
    // translate the IDs to their corresponding names
    const chosenProjectsIds = JSON.parse(params.get("projects")) ?? [];

    setFormData({
      initialMonth: params.get("initialMonth") ?? "",
      finalMonth: params.get("finalMonth") ?? "",
      initialValue: params.get("initialValue") ?? "",
      finalValue: params.get("finalValue") ?? "",
      projects: getChosenProjectsNames(chosenProjectsIds) ?? [],
      hasNif: params.get("hasNif") ?? "any",
      hasFile: params.get("hasFile") ?? "any",
      includeReceipts: false,
      selectedSortOptionIdx: findSelectedOptionIdx(),
    });
  }

  // Refs
  const formRef = useRef();

  // Form state
  const [formData, setFormData] = useState({
    initialMonth: params.get("initialMonth") ?? "",
    finalMonth: params.get("finalMonth") ?? "",
    initialValue: params.get("initialValue") ?? "",
    finalValue: params.get("finalValue") ?? "",
    projects: [],
    hasNif: params.get("hasNif") ?? "any",
    hasFile: params.get("hasFile") ?? "any",
    includeReceipts: false,
    selectedSortOptionIdx: findSelectedOptionIdx(),
  });

  function findSelectedOptionIdx(selectedOptionName = null) {
    let idx = -1;
    if (selectedOptionName === null) {
      if (params.get("orderBy") && params.get("order")) {
        idx = sortOptions.findIndex(
          option => option.orderBy === params.get("orderBy") && option.order === params.get("order")
        );
      }
    } else {
      idx = sortOptions.findIndex(option => option.name === selectedOptionName);
    }
    return idx === -1 ? 0 : idx;
  }

  function handleSortOptionsChange(event) {
    const value = event.target.value;

    setFormData(oldFormData => ({
      ...oldFormData,
      selectedSortOptionIdx: findSelectedOptionIdx(value),
    }));
  }

  // Memoize sort options names to avoid computing them in every re-render
  const sortOptionsNames = useMemo(() => sortOptions.map(opt => opt.name), [sortOptions]);

  // Handle form changes
  function handleChange(e) {
    if (loading) return;

    const name = e.target.name;
    const value = e.target.value;

    setFormData(oldFormData => ({
      ...oldFormData,
      [name]: value,
    }));
  }

  const [loading, setLoading] = useState(false);

  function handleIncludeReceiptsChange(newValue) {
    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        includeReceipts: newValue,
      }));
  }

  function handleNifChange(newValue) {
    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        hasNif: newValue,
      }));
  }

  function handleHasFileChange(newValue) {
    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        hasFile: newValue,
      }));
  }

  function clearFilters(event) {
    event.preventDefault();
    setFormData(oldFormData => ({
      ...oldFormData,
      initialMonth: "",
      finalMonth: "",
      initialValue: "",
      finalValue: "",
      projects: [],
      hasNif: "any",
      hasFile: "any",
    }));
  }

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

    // Check date
    if (
      formData.initialMonth &&
      formData.finalMonth &&
      formData.initialMonth > formData.finalMonth
    ) {
      showErrorMsg("Final month can't precede Initial month", {
        anchorOrigin: { horizontal: "center", vertical: "top" },
      });
      return;
    }

    // Check values
    if (
      formData.initialValue &&
      formData.finalValue &&
      parseFloat(formData.initialValue) > parseFloat(formData.finalValue)
    ) {
      showErrorMsg("Max value can't be lower than the Min value", {
        anchorOrigin: { horizontal: "center", vertical: "top" },
      });
      return;
    }

    let filters = [];

    if (formData.initialMonth !== "") filters.push(["initialMonth", formData.initialMonth]);
    if (formData.finalMonth !== "") filters.push(["finalMonth", formData.finalMonth]);
    if (formData.initialValue !== "") filters.push(["initialValue", formData.initialValue]);
    if (formData.finalValue !== "") filters.push(["finalValue", formData.finalValue]);
    if (formData.hasNif !== "any") filters.push(["hasNif", formData.hasNif]);
    if (formData.hasFile !== "any") filters.push(["hasFile", formData.hasFile]);
    if (formData.projects.length > 0)
      filters.push(["projects", `[${getChosenProjectsIds(formData.projects)}]`]);
    if (
      !(
        sortOptions[formData.selectedSortOptionIdx].orderBy === "date" &&
        sortOptions[formData.selectedSortOptionIdx].order === "DESC"
      )
    ) {
      filters.push(["orderBy", sortOptions[formData.selectedSortOptionIdx].orderBy]);
      filters.push(["order", sortOptions[formData.selectedSortOptionIdx].order]);
    }

    let queryParams = {
      includeReceipts: formData.includeReceipts,
    };

    for (const el of filters) {
      queryParams = {
        ...queryParams,
        [el[0]]: el[1],
      };
    }

    setLoading(true);

    axios_instance
      .get("transactions/report", {
        params: queryParams,
        responseType: "blob",
      })
      .then(res => {
        if (res.status === 200) return res.data;
        else throw new Error();
      })
      .then(data => {
        // create file link in browser's memory
        const href = URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", `report.pdf`);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = "Couldn't generate report";
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response)
          msg += `. ${("" + err.response.status)[0] === "4" ? "Bad client request" : "Internal server error"}`;

        showErrorMsg(msg);
      })
      .finally(() => {
        setLoading(false);
        setOpen(false);
      });
  }

  // Memoize project names to avoid computing them in every re-render
  const projectsNames = useMemo(() => projectsList.map(p => p.name), [projectsList]);

  function getChosenProjectsNames(chosenProjectsIds) {
    if (projectsList.length > 0)
      return chosenProjectsIds.map(value => {
        return projectsList.find(el => el.id === value)?.name;
      });
    return [];
  }

  function getChosenProjectsIds(chosenProjects) {
    return chosenProjects.map(value => {
      return projectsList.find(el => el.name === value)?.id;
    });
  }

  function handleProjectsChange(event) {
    const value = event.target.value;

    setFormData(oldFormData => ({
      ...oldFormData,
      // On autofill we get a stringified value.
      projects: typeof value === "string" ? value.split(",") : value,
    }));
  }

  // Reset form data everytime the modal is opened, to sync with the current
  // filters used
  useEffect(() => {
    if (open) reset();
  }, [open, projectsList]);

  return (
    <>
      <button className="btn icon-btn" id="generate-report-btn" onClick={handleOpen}>
        <SummarizeIcon />
        Report
      </button>

      <Modal
        className="modal transaction-modal"
        id="generate-report-modal"
        open={open}
        disableRestoreFocus
        onClose={(e, reason) => handleClose(reason)}
        closeAfterTransition
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Grow in={open} easing={{ exit: "ease-in" }}>
          <Box className="box transaction-box">
            <form
              encType="multipart/form-data"
              ref={formRef}
              id="generate-report-form"
              onSubmit={submitForm}
            >
              <div className="form-header">
                <CloseIcon className="modal-close-btn" onClick={handleClose} />
                <h1>Generate Report</h1>
              </div>

              <div className="form-body">
                <div className="generate-report-group">
                  <h2>Applied filters to transactions</h2>
                  <div className="form-row">
                    <div className="form-group" id="transactions-report-initial-month-group">
                      <label htmlFor="date">Initial month:</label>
                      <input
                        type="month"
                        name="initialMonth"
                        id="transactions-report-initial-month"
                        value={formData.initialMonth}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group" id="transactions-report-final-month-group">
                      <label htmlFor="date">Final month:</label>
                      <input
                        type="month"
                        name="finalMonth"
                        id="transactions-report-final-month"
                        value={formData.finalMonth}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group" id="transactions-report-initial-value-group">
                      <div className="transactions-filter-label-group">
                        <label htmlFor="value" className="transactions-filter-value-label">
                          Min value:
                        </label>
                        <span className="value-help">(?)</span>
                      </div>
                      <input
                        className="transactions-filter-value"
                        type="number"
                        name="initialValue"
                        placeholder="0.00"
                        step={0.01}
                        id="transactions-report-initial-value"
                        value={formData.initialValue}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group" id="transactions-report-final-value-group">
                      <div className="transactions-filter-label-group">
                        <label htmlFor="value" className="transactions-filter-value-label">
                          Max value:
                        </label>
                        <span className="value-help">(?)</span>
                      </div>
                      <input
                        className="transactions-filter-value"
                        type="number"
                        name="finalValue"
                        placeholder="0.00"
                        step={0.01}
                        id="transactions-report-final-value"
                        value={formData.finalValue}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row" id="generate-report-projects-row">
                    <div className="form-group" id="transactions-report-projects-group">
                      <label htmlFor="projects">Projects:</label>
                      <SelectDropdown
                        options={projectsNames}
                        selectedOptions={formData.projects}
                        handleChange={handleProjectsChange}
                        nullOption={"None"}
                        multiple={true}
                      />
                    </div>

                    <div className="form-group" id="transactions-report-nif-group">
                      <label htmlFor="nif">Has NIF:</label>
                      <ToggleButtonGroup
                        value={formData.hasNif}
                        exclusive
                        onChange={(e, value) => handleNifChange(value)}
                        id="transactions-report-nif-buttons"
                      >
                        <ToggleButton className="toggle-button left" value={"false"}>
                          <CloseIcon />
                          No
                        </ToggleButton>
                        <ToggleButton className="toggle-button" value={"any"}>
                          Any
                        </ToggleButton>
                        <ToggleButton className="toggle-button right" value={"true"}>
                          <CheckIcon />
                          Yes
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>

                    <div className="form-group" id="transactions-report-file-group">
                      <label htmlFor="file">Has receipt:</label>
                      <ToggleButtonGroup
                        value={formData.hasFile}
                        exclusive
                        onChange={(e, value) => handleHasFileChange(value)}
                        id="transactions-report-nif-buttons"
                      >
                        <ToggleButton className="toggle-button left" value={"false"}>
                          <CloseIcon />
                          No
                        </ToggleButton>
                        <ToggleButton className="toggle-button" value={"any"}>
                          Any
                        </ToggleButton>
                        <ToggleButton className="toggle-button right" value={"true"}>
                          <CheckIcon />
                          Yes
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                  </div>
                </div>

                <div className="generate-report-group">
                  <h2>Generation options</h2>
                  <div className="form-row" id="generate-report-options-row">
                    <div className="form-group" id="transactions-report-sort-group">
                      <label htmlFor="sort">Sort transactions by:</label>
                      <SelectDropdown
                        options={sortOptionsNames}
                        selectedOptions={sortOptions[formData.selectedSortOptionIdx].name}
                        handleChange={handleSortOptionsChange}
                      />
                    </div>

                    <div className="form-group" id="transactions-report-include-receipts-group">
                      <label htmlFor="include-receipts">Include receipts?</label>
                      <ToggleButtonGroup
                        value={formData.includeReceipts}
                        exclusive
                        onChange={(e, value) => handleIncludeReceiptsChange(value)}
                        id="transactions-report-include-receipts-buttons"
                      >
                        <ToggleButton className="toggle-button left" value={false}>
                          <CloseIcon />
                          No
                        </ToggleButton>
                        <ToggleButton className="toggle-button right" value={true}>
                          <CheckIcon />
                          Yes
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                  </div>
                </div>
              </div>

              <hr />
              <div className="form-row last">
                <button className="btn transactions-filter-clear-btn" onClick={clearFilters}>
                  Clear filters
                </button>
                <button
                  type="submit"
                  className={`btn ${loading && "icon-btn"}`}
                  id="create-report-btn"
                >
                  {loading && <CircularProgress className="loading-circle" />}
                  {loading ? "Generating" : "Generate"}
                </button>
              </div>
            </form>
          </Box>
        </Grow>
      </Modal>
    </>
  );
}

export default TransactionsReportBtn;
