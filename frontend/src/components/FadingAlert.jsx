import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';

function FadingAlert({ show, onClose, className, children, severity = 'info', duration = 2000, timeout = 1000 }) {

    // set the duration timer
    useEffect(() => {
        let timeId;
        if (show) {
            timeId = setTimeout(() => {
                onClose();
            }, duration)
        }
        return () => {
            clearTimeout(timeId)
        };

    }, [show]);

    // If show is true the alert will be rendered
    return (
        <Fade in={show} timeout={timeout} mountOnEnter unmountOnExit >
            <Alert className={className} severity={severity} onClose={onClose}>
                {children}
            </Alert>
        </Fade>
    )
}

export default FadingAlert;