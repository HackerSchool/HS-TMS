import React, { useState, useCallback } from 'react';
import '../styles/Charts.css'
import PrintIcon from '@mui/icons-material/Print';
import MonthHistogram from '../components/MonthHistogram';
import TransactionsSortButton from '../components/TypeOfYearBtn';
import ProjectLineChart from '../components/ProjectLineChart';
import BalanceTimeSeries from '../components/BalanceTimeSeries';
import StackedBarChart from '../components/StackedBarChart';
//time series da evolução do balance
//gráfico de earnings com a data real em vez de ser por mês?
//Talvez fazer comparação dos gastos dos projetos com os gastos médios de todos os projetos?

function ChartsPage() {
    const [fetchTransactions, setFetchTransactions] = useState(true);
    const [typeOfYear, setTypeOfYear]=useState("civic")
    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    return (
        <section className="page" id='ChartsPage'>
            <header>
                <h1>
                    Charts
                </h1>
                <div className="btn-group left">
                        <button className='btn icon-btn'>
                            <PrintIcon />
                            Print
                        </button>
                </div>
                <div className="btn-group right">
                    <TransactionsSortButton
                        setTypeOfYear={setTypeOfYear}
                        refetch={refetchTransactions} 
                    />
                </div>
            </header>
            <div className="content-container">
                <div className="charts">
                    <MonthHistogram title="Transactions Histogram" typeOfYear={typeOfYear} fetchTransactions={fetchTransactions} setFetchTransactions={setFetchTransactions}/>
                    <div className="chart-box">
                        <div className="chart-header">
                            <div className="chartTitle">Balance</div>
                        </div>
                        <div className="chart">
                            <BalanceTimeSeries title="Balance" disableRange={false} inDashboard={false}/>
                        </div>
                    </div>                    
                    <StackedBarChart title="Transactions Distribution"/>
                    <ProjectLineChart title="Project Transactions 1"/>
                    <ProjectLineChart title="Project Transactions 2"/>
                    <ProjectLineChart title="Project Transactions 3"/>

                </div>
            </div>
        </section>
    );
}

export default ChartsPage;