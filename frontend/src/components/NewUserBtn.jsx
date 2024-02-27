import React, { useState, useEffect, useRef } from "react";
import axios_instance from "../Axios";
import { showErrorMsg, showSuccessMsg } from "../Alerts";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Grow from "@mui/material/Grow";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

function NewUserBtn({ refetch }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = reason => {
    if (loading) return;

    setOpen(false);
  };

  function reset() {
    setFormData({
      name: "",
      username: "",
    });
  }

  // Refs
  const formRef = useRef();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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

    if (!formData.username.match(/^ist[0-9]+$/g)) {
      showErrorMsg(
        'The username has to be a "Técnico ID", that is, an expression like "ist123456"',
        { anchorOrigin: { horizontal: "center", vertical: "top" } }
      );
      return;
    }

    const body = {
      name: formData.name,
      username: formData.username,
    };

    setLoading(true);

    axios_instance
      .post("users", body)
      .then(res => {
        if (res.status === 201) {
          showSuccessMsg("User created successfully");
          refetch();
        } else throw new Error();
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = "Couldn't create user";
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
      <button className="btn icon-btn small" id="new-user-btn" onClick={handleOpen}>
        <AddIcon />
        New
      </button>

      <Modal
        className="modal user-modal"
        id="new-user-modal"
        open={open}
        disableRestoreFocus
        onClose={(e, reason) => handleClose(reason)}
        closeAfterTransition
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Grow in={open} easing={{ exit: "ease-in" }}>
          <Box className="box user-box">
            <form
              encType="multipart/form-data"
              ref={formRef}
              id="create-user-form"
              onSubmit={submitForm}
            >
              <div className="form-header">
                <CloseIcon className="modal-close-btn" onClick={handleClose} />
                <h1>New User</h1>
              </div>

              <div className="form-body">
                <div className="form-row user-name-username-row">
                  <div className="form-group user-name-group" id="create-user-name-group">
                    <label htmlFor="create-user-name">Name: *</label>
                    <input
                      type="text"
                      name="name"
                      className="user-name"
                      id="create-user-name"
                      placeholder="First and last name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group user-username-group" id="create-user-username-group">
                    <label htmlFor="create-user-username">Username: *</label>
                    <input
                      type="text"
                      name="username"
                      id="create-user-username"
                      placeholder="ist1xxxxx"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <p>
                    <b style={{ color: "var(--hs-logo)", fontSize: "1.2rem" }}>NOTE: </b>
                    The provided name is temporary, as it will be replaced by the information
                    retrieved from Fenix during the first login, which triggers the user activation.
                    Until then, the user status will be{" "}
                    <i style={{ color: "var(--light-gray)" }}>pending activation</i>.
                  </p>
                </div>
              </div>

              <hr />
              <div className="form-row last">
                <button
                  type="submit"
                  className={`btn submit-btn ${loading && "icon-btn"}`}
                  id="create-user-btn"
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

export default NewUserBtn;
