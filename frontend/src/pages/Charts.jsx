import React, { useState, useCallback } from 'react';
import '../styles/Charts.css'
import PrintIcon from '@mui/icons-material/Print';
import LineChart from '../components/LineChart';
import MonthHistogram from '../components/MonthHistogram';
import TransactionsSortButton from '../components/TypeOfYearBtn';
//Fazer gráfico da evolução do balance
//Talvez fazer comparação dos gastos dos projetos com os gastos médios de todos os projetos?

function ChartsPage() {
    const [fetchTransactions, setFetchTransactions] = useState(true);
    const [title, setTitle]=useState("Transaction Histogram")
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
                        setTitle={setTitle}
                        refetch={refetchTransactions} 
                    />
                </div>
            </header>
            <div className="content-container">
                <div className="charts">
                    <MonthHistogram title={title} fetchTransactions={fetchTransactions} setFetchTransactions={setFetchTransactions}/>
                    <LineChart title="Transaction Boxplot"/>
                    <LineChart title="Project Transactions 1"/>
                    <LineChart title="Project Transactions 2"/>
                    <LineChart title="Project Transactions 3"/>
                    <LineChart title="Project Transactions 4"/>

                </div>
            </div>
        </section>
    );
}

export default ChartsPage;