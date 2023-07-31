import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';


function ConfirmationModal({ open, title, content, onCancel, onConfirm }) {

    const handleClose = (reason) => onCancel();

    return (
        <Modal
            className="modal confirmation-modal"
            open={open}
            disableRestoreFocus
            onClose={(e, reason) => handleClose(reason)}
            closeAfterTransition
            slotProps={{ backdrop: { timeout: 300 } }}
        >
            <Grow in={open} easing={{ exit: "ease-in" }} timeout={300} >
                <Box className="box confirmation-box" >
                    <h2 className="title">{title}</h2>
                    <hr />
                    <div className="content">{content}</div>
                    <hr />
                    <div className="btn-group">
                        <button className="btn cancel" onClick={() => onCancel()}>
                            Cancel
                        </button>

                        <button className="btn" onClick={() => onConfirm()}>
                            OK
                        </button>
                    </div>
                </Box>
            </Grow>
        </Modal>
    );
}

export default ConfirmationModal;