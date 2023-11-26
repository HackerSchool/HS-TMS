import { enqueueSnackbar } from "notistack"

export function showSuccessMsg(msg, options = {}) {
    return enqueueSnackbar(msg, { variant: "success", className: "alert-success", ...options })
}

export function showErrorMsg(msg, options = {}) {
    return enqueueSnackbar(msg, { variant: "error", className: "alert-error", ...options })
}

export function showWarningMsg(msg, options = {}) {
    return enqueueSnackbar(msg, { variant: "warning", className: "alert-warning", ...options })
}