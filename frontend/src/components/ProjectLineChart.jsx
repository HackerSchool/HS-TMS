import React, { useEffect, useState, useCallback } from "react";
import { showErrorMsg } from "../Alerts"
import axios_instance from "../Axios";
import ProjectSelectBtn from "./ProjectSelectBtn";
import BalanceTimeSeries from "./BalanceTimeSeries";
import CircularProgress from '@mui/material/CircularProgress';

//Botão visível dependendo do valor de disableProjectSelectBtn
//Talvez faça mais sentido só adicionar os projetos ativos às opções?
//Possivelmente fazer opção na página dos projetos para se ver os gráficos relativos aos mesmos independentemente se são ativos ou não?
//Título dependente do projeto escolhido? FIXME

function ProjectLineChart({ title, projectList, projectsLoading }) {
    
    // projectIID is undefined until a project is selected
    const [projectID, setProjectID] = useState();
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    const updateProjectID = useCallback((projID) => {
        if (projID === -1) {
            setTransactionsLoading(false);
        } else if (projID !== undefined) {
            setProjectID(projID);
        }
    });

    useEffect(() => {
        if (projectID !== undefined) {
            setTransactionsLoading(true);

            axios_instance.get("transactions", {
                params: {
                    order: 'ASC',
                    balanceBy: projectID
                },
            })
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setTransactions(data))
            .catch(err => {
                if (err.handledByMiddleware) return;

                let msg = "Couldn't fetch project's transactions";
                if (err.reqTimedOut)
                    msg += ". Request timed out";
                else if (err.response)
                    msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;

                showErrorMsg(msg);
            })
            .finally(() => setTransactionsLoading(false));
        }
    }, [projectID]);

    return (
        <div className="chart-box">
            <div className="chart-header">
                <div className="chartTitle">{title}</div>
                {(projectsLoading || transactionsLoading) && (
                    <CircularProgress
                        className="loading-circle"
                        style={{ marginLeft: 10, marginRight: "auto" }}
                    />
                )}
                <div className="projectSelect">
                    <ProjectSelectBtn
                        projectList={projectList}
                        projectsLoading={projectsLoading}
                        transactionsLoading={transactionsLoading}
                        updateProjectID={updateProjectID}
                        // Extract a default index from the title (the chart number)
                        defaultIdx={isNaN(parseInt(title.substr(title.length-1)))
                                    ? 0
                                    : parseInt(title.substr(title.length-1)) - 1}
                    />
                </div>
            </div>
            <div className="chart">
                <BalanceTimeSeries
                    transactions={transactions}
                    loading={transactionsLoading || projectsLoading}
                    disableRange={false}
                    inDashboard={false}
                />
            </div>
        </div>
    );
  }

export default ProjectLineChart;