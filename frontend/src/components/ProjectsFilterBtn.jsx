import React, { useState } from "react";
import { showErrorMsg } from "../Alerts";
import TuneIcon from "@mui/icons-material/Tune";
import Modal from "@mui/material/Modal";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";

function ProjectsFilterBtn({ params, setParams, refetch }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = reason => {
    setOpen(false);
  };

  const defaultFilters = {
    initialBalance: "",
    finalBalance: "",
    active: "any",
    symbolic: "any",
  };

  const [formData, setFormData] = useState({
    initialBalance: params.get("initialBalance") ?? "",
    finalBalance: params.get("finalBalance") ?? "",
    active: params.get("active") ?? "any",
    symbolic: params.get("symbolic") ?? "any",
  });

  // Handle form changes
  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    setFormData(oldFormData => ({
      ...oldFormData,
      [name]: value,
    }));
  }

  function handleActiveChange(newValue) {
    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        active: newValue,
      }));
  }

  function handleSymbolicChange(newValue) {
    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        symbolic: newValue,
      }));
  }

  function clearFilters(event) {
    event.preventDefault();
    setFormData(defaultFilters);
  }

  function updateFilters(event) {
    // stop all the default form submission behaviour
    event.preventDefault();

    // Check balances
    if (
      formData.initialBalance &&
      formData.finalBalance &&
      parseFloat(formData.initialBalance) > parseFloat(formData.finalBalance)
    ) {
      showErrorMsg("Max balance can't be lower than the Min balance", {
        anchorOrigin: { horizontal: "right", vertical: "top" },
      });
      return;
    }

    let filters = [];

    if (formData.initialBalance !== "") filters.push(["initialBalance", formData.initialBalance]);
    if (formData.finalBalance !== "") filters.push(["finalBalance", formData.finalBalance]);
    if (formData.active !== "any") filters.push(["active", formData.active]);
    if (formData.symbolic !== "any") filters.push(["symbolic", formData.symbolic]);

    let queryParams = {};

    for (const el of filters) {
      queryParams = {
        ...queryParams,
        [el[0]]: el[1],
      };
    }

    setParams(oldParams => {
      if (oldParams.get("orderBy") && oldParams.get("order")) {
        queryParams = {
          ...queryParams,
          orderBy: oldParams.get("orderBy"),
          order: oldParams.get("order"),
        };
      }

      return queryParams;
    });
    refetch();
    setOpen(false);
  }

  return (
    <>
      <button className="btn icon-btn" id="projects-filter-btn" onClick={handleOpen}>
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
        <Slide in={open} direction="left">
          <Box className="box filters-box">
            <form id="projects-filter-form" onSubmit={updateFilters}>
              <div className="form-header">
                <ArrowBackIcon className="modal-close-btn" onClick={handleClose} />
                <h1>Filters</h1>
              </div>

              <div className="form-body">
                <div className="form-row">
                  <div className="form-group" id="projects-filter-initial-balance-group">
                    <div className="projects-filter-label-group">
                      <label
                        htmlFor="projects-filter-initial-balance"
                        className="projects-filter-balance-label"
                      >
                        Min balance:
                      </label>
                    </div>
                    <input
                      type="number"
                      name="initialBalance"
                      className="projects-filter-balance"
                      id="projects-filter-initial-balance"
                      placeholder="0.00"
                      step={0.01}
                      value={formData.initialBalance}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group" id="projects-filter-final-balance-group">
                    <div className="projects-filter-label-group">
                      <label
                        htmlFor="projects-filter-final-balance"
                        className="projects-filter-balance-label"
                      >
                        Max balance:
                      </label>
                    </div>
                    <input
                      type="number"
                      name="finalBalance"
                      className="projects-filter-balance"
                      id="projects-filter-final-balance"
                      placeholder="0.00"
                      step={0.01}
                      value={formData.finalBalance}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" id="projects-filter-active-group">
                    <label>Active:</label>
                    <ToggleButtonGroup
                      value={formData.active}
                      exclusive
                      onChange={(e, value) => handleActiveChange(value)}
                      id="projects-filter-active-buttons"
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

                  <div className="form-group" id="projects-filter-symbolic-group">
                    <label>Symbolic:</label>
                    <ToggleButtonGroup
                      value={formData.symbolic}
                      exclusive
                      onChange={(e, value) => handleSymbolicChange(value)}
                      id="projects-filter-symbolic-buttons"
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

              <hr />
              <div className="form-row last">
                <button
                  type="button"
                  className="btn"
                  id="projects-filter-clear-btn"
                  onClick={clearFilters}
                >
                  Clear
                </button>
                <button type="submit" className="btn" id="projects-filter-save-btn">
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
