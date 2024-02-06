import React, { useState, useEffect, useRef } from "react";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg } from "../Alerts";
import Modal from "@mui/material/Modal";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import CircularProgress from "@mui/material/CircularProgress";

function ProjectEditModal({ open, setOpen, project, refetch }) {
  const handleClose = reason => {
    if (loading) return;

    setOpen(false);
  };

  function reset() {
    setFormData({
      name: project.name,
      active: project.active,
    });
  }

  // refs
  const formRef = useRef();

  // Form state
  const [formData, setFormData] = useState({
    name: project.name,
    active: project.active,
  });

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

  function handleActiveChange(newValue) {
    if (loading) return;

    // so there's always a button selected
    if (newValue !== null)
      setFormData(oldFormData => ({
        ...oldFormData,
        active: newValue,
      }));
  }

  const [loading, setLoading] = useState(false);

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

    const body = {
      name: formData.name,
      active: formData.active,
    };

    setLoading(true);

    axios_instance
      .put(`projects/${project.id}`, body)
      .then(res => {
        if (res.status == 200) {
          showSuccessMsg("Project updated successfully");
          refetch();
        } else throw new Error();
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = "Couldn't update Project";
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response) {
          const status = String(err.response.status);
          if (status.startsWith("4")) {
            msg += ". Bad client request";
          } else if (status.startsWith("5")) {
            msg += ". Internal server error";
            refetch();
          }
        }

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
  }, [open]);

  return (
    <Modal
      className="modal project-modal"
      id="edit-project-modal"
      open={open}
      disableRestoreFocus
      onClose={(e, reason) => handleClose(reason)}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Grow in={open} easing={{ exit: "ease-in" }}>
        <Box className="box project-box">
          <form
            encType="multipart/form-data"
            ref={formRef}
            id="edit-project-form"
            onSubmit={submitForm}
          >
            <div className="form-header">
              <CloseIcon className="modal-close-btn" onClick={handleClose} />
              <h1>Edit Project {project.name}</h1>
            </div>

            <div className="form-body">
              <div className="form-row ">
                <div className="form-group project-name-group" id="edit-project-name-group">
                  <label htmlFor="name">Name: *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name of the project"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group project-active-group" id="edit-project-active-group">
                  <label htmlFor="active">Active:</label>
                  <ToggleButtonGroup
                    value={formData.active}
                    exclusive
                    onChange={(e, value) => handleActiveChange(value)}
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

            <hr />
            <div className="form-row last">
              <button
                type="submit"
                className={`btn submit-btn ${loading && "icon-btn"}`}
                id="edit-ptoject-btn"
              >
                {loading && <CircularProgress className="loading-circle" />}
                {loading ? "Saving" : "Save"}
              </button>
            </div>
          </form>
        </Box>
      </Grow>
    </Modal>
  );
}

export default ProjectEditModal;
