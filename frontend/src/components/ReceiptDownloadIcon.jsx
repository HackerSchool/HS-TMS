import React, { useState } from "react";
import axios_instance from "../Axios";
import { showErrorMsg } from "../Alerts";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import CircularProgress from "@mui/material/CircularProgress";

export default function ReceiptDownloadIcon({ id }) {
  const [pending, setPending] = useState(false);

  return (
    <div
      className="receipt-download-icon-container"
      style={{ cursor: "pointer", position: "relative" }}
      onClick={() => {
        setPending(true);
        axios_instance
          .get(`transactions/download/${id}`, {
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
            link.setAttribute("download", `receipt${id}.pdf`);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(href);
          })
          .catch(err => {
            if (err.handledByMiddleware) return;

            let msg = "Couldn't download the receipt";
            if (err.reqTimedOut) msg += ". Request timed out";
            else if (err.response)
              msg += `. ${("" + err.response.status)[0] === "4" ? "Bad client request" : "Internal server error"}`;

            showErrorMsg(msg);
          })
          .finally(() => setPending(false));
      }}
    >
      {pending ? (
        <CircularProgress className="loading-circle small" />
      ) : (
        <RequestPageIcon className="receipt-download-icon" />
      )}
    </div>
  );
}
