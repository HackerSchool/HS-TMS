import React, { useState, useEffect } from 'react';
import '../styles/Charts.css'
import axios_instance from '../Axios';
import MonthHistogram from '../components/MonthHistogram';
import TransactionsSortButton from '../components/TypeOfYearBtn';
import ProjectLineChart from '../components/ProjectLineChart';
import BalanceTimeSeries from '../components/BalanceTimeSeries';
import StackedBarChart from '../components/StackedBarChart';
import CircularProgress from '@mui/material/CircularProgress';

//time series da evolução do balance
//gráfico de earnings com a data real em vez de ser por mês?
//Talvez fazer comparação dos gastos dos projetos com os gastos médios de todos os projetos? FIXME

function ChartsPage() {
    const [typeOfYear, setTypeOfYear] = useState("civic");

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
                let msg = "Couldn't fetch projects";
                if (err.response)
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
                let msg = "Couldn't fetch transactions";
                if (err.response)
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
                    <TransactionsSortButton
                        setTypeOfYear={setTypeOfYear}
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