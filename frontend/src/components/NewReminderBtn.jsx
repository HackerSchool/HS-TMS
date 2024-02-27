import React, { useState, useEffect, useRef } from "react";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg } from "../Alerts";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

function NewReminderBtn({ refetch }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = reason => {
    if (loading) return;

    setOpen(false);
  };

  function reset() {
    setFormData({
      date: "",
      title: "",
      description: "",
    });
  }

  // Refs
  const formRef = useRef();

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
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
      date: formData.date,
      title: formData.title,
      description: formData.description,
    };

    setLoading(true);

    axios_instance
      .post("reminders", body)
      .then(res => {
        if (res.status === 201) {
          showSuccessMsg("Reminder created successfully");
          refetch();
        } else throw new Error();
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = "Couldn't create reminder";
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
    <>
      <button className="btn icon-btn" id="new-reminder-btn" onClick={handleOpen}>
        <AddIcon />
        New
      </button>

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
            <form
              encType="multipart/form-data"
              ref={formRef}
              id="create-reminder-form"
              onSubmit={submitForm}
            >
              <div className="form-header">
                <CloseIcon className="modal-close-btn" onClick={handleClose} />
                <h1>New Reminder</h1>
              </div>

              <div className="form-body">
                <div className="form-row reminder-date-title-row">
                  <div className="form-group reminder-date-group" id="create-reminder-date-group">
                    <label htmlFor="create-reminder-date">Date: *</label>
                    <input
                      type="date"
                      name="date"
                      className="reminder-date"
                      id="create-reminder-date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group reminder-title-group" id="create-reminder-title-group">
                    <label htmlFor="create-reminder-title">Title: *</label>
                    <input
                      type="text"
                      name="title"
                      className="reminder-title"
                      id="create-reminder-title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Title of the reminder"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div
                    className="form-group reminder-description-group"
                    id="create-reminder-description-group"
                  >
                    <label htmlFor="create-reminder-description">Description:</label>
                    <input
                      type="text"
                      name="description"
                      id="create-reminder-description"
                      placeholder="Description of the reminder"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <hr />
              <div className="form-row last">
                <button
                  type="submit"
                  className={`btn submit-btn ${loading && "icon-btn"}`}
                  id="create-reminder-btn"
                >
                  {loading && <CircularProgress className="loading-circle" />}
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
