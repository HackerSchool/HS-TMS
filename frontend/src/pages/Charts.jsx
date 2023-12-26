import React, { useState, useEffect } from 'react';
import { showErrorMsg } from "../Alerts"
import '../styles/Charts.css'
import axios_instance from '../Axios';
import MonthHistogram from '../components/MonthHistogram';
import ProjectLineChart from '../components/ProjectLineChart';
import BalanceTimeSeries from '../components/BalanceTimeSeries';
import StackedBarChart from '../components/StackedBarChart';
import DropdownBtn from '../components/DropdownBtn';
import CircularProgress from '@mui/material/CircularProgress';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

//time series da evolução do balance
//gráfico de earnings com a data real em vez de ser por mês?
//Talvez fazer comparação dos gastos dos projetos com os gastos médios de todos os projetos? FIXME

const yearTypeOptions = [
    { name: 'Civic Years', type:'civic' },
    { name: 'Academic Years', type:'academic' },
];

function ChartsPage() {
    const [typeOfYear, setTypeOfYear] = useState(yearTypeOptions[0].type);

    const onYearTypeSelection = (chosenOption) => {
        setTypeOfYear(chosenOption.type);
    }

    // list of all existing projects and transactions for child components to use
    const [projectsList, setProjectsList] = useState([]);
    const [transactionsList, setTransactionsList] = useState([]);

    const [projectsLoading, setProjectsLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    // fetch all projects and transactions everytime the page is opened
    useEffect(() => {
        axios_instance.get("projects")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setProjectsList(data))
            .catch(err => {
                if (err.handledByMiddleware) return;

                let msg = "Couldn't fetch projects";
                if (err.reqTimedOut)
                    msg += ". Request timed out";
                else if (err.response)
                    msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;

                showErrorMsg(msg);
            })
            .finally(() => setProjectsLoading(false));

        axios_instance.get("transactions")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setTransactionsList(data))
            .catch(err => {
                if (err.handledByMiddleware) return;

                let msg = "Couldn't fetch transactions";
                if (err.reqTimedOut)
                    msg += ". Request timed out";
                else if (err.response)
                    msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;

                showErrorMsg(msg);
            })
            .finally(() => setTransactionsLoading(false));
    }, []);

    return (
        <section className="page" id='ChartsPage'>
            <header>
                <h1>Charts</h1>
                <div className="btn-group right">
                    <DropdownBtn
                        icon={<EditCalendarIcon />}
                        options={yearTypeOptions}
                        onOptionSelection={onYearTypeSelection}
                        defaultIndex={0}
                    />
                </div>
            </header>
            <div className="content-container">
                <div className="charts">
                    <MonthHistogram
                        title="Transactions Histogram"
                        typeOfYear={typeOfYear}
                        transactionsList={transactionsList}
                        loading={transactionsLoading}
                    />
                    <StackedBarChart
                        title="Transactions Distribution"
                        typeOfYear={typeOfYear}
                        projectList={projectsList}
                        transactionsList={transactionsList}
                        loading={projectsLoading || transactionsLoading}
                    />
                    <div className="chart-box">
                        <div className="chart-header">
                            <div className="chartTitle">Balance</div>
                            {transactionsLoading &&
                            <CircularProgress
                                className="loading-circle small"
                                style={{ marginLeft: 10, marginRight: "auto" }}
                            />}
                        </div>
                        <div className="chart">
                            <BalanceTimeSeries
                                transactions={transactionsList}
                                loading={transactionsLoading}
                                disableRange={false}
                                inDashboard={false}
                            />
                        </div>
                    </div> 
                    <ProjectLineChart
                        title="Project Balance 1"
                        projectList={projectsList}
                        projectsLoading={projectsLoading}
                    />
                    <ProjectLineChart
                        title="Project Balance 2"
                        projectList={projectsList}
                        projectsLoading={projectsLoading}
                    />
                    <ProjectLineChart
                        title="Project Balance 3"
                        projectList={projectsList}
                        projectsLoading={projectsLoading}
                    />

                </div>
            </div>
        </section>
    );
}

export default ChartsPage;