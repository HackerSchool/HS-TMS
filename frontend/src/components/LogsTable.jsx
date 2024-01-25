import React, { useEffect, useState } from "react";
import axios_instance from "../Axios";
import { showErrorMsg, showWarningMsg } from "../Alerts";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";

function LogsTable() {
  const [tab, setTab] = useState("error");
  const [logs, setLogs] = useState({
    error: undefined,
    combined: undefined,
  });
  const [loading, setLoading] = useState({
    error: false,
    combined: false,
  });

  useEffect(() => {
    if (logs[tab] !== undefined || loading[tab]) return;

    setLoading(prevLoading => ({ ...prevLoading, [tab]: true }));

    axios_instance
      .get(`logs/${tab}`)
      .then(res => {
        if (res.status == 200) return res.data;
        throw new Error("Couldn't fetch logs");
      })
      .then(data => {
        if (data.length === 0) showWarningMsg(`No ${tab} logs found`);

        setLogs(prevLogs => ({ ...prevLogs, [tab]: data }));
      })
      .catch(err => {
        if (err.handledByMiddleware) return;

        let msg = `Couldn't fetch ${tab} logs`;
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response)
          msg += `. ${("" + err.response.status)[0] === "4" ? "Bad client request" : "Internal server error"}`;

        showErrorMsg(msg);
      })
      .finally(() => setLoading(prevLoading => ({ ...prevLoading, [tab]: false })));
  }, [tab]);

  return (
    <div className="logs-container">
      <Tabs value={tab} onChange={(e, value) => setTab(value)}>
        <Tab value={"error"} label={"error"} sx={{ color: "white" }} />
        <Tab value={"combined"} label={"combined"} sx={{ color: "white" }} />
      </Tabs>

      <div className="logs-content">
        {loading[tab] ? (
          <CircularProgress className="loading-circle medium" sx={{ m: 5 }} />
        ) : logs[tab] === undefined || logs[tab].length === 0 ? (
          `No ${tab} logs found`
        ) : (
          <div className={`logs-list ${tab}`}>
            {logs[tab].map((log, idx) => (
              <span
                key={idx}
                className={log.level}
              >{`[${log.timestamp}] ${log.level}: ${log.message}`}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LogsTable;
