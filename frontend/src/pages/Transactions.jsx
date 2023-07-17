import React, { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom"
import axios_instance from '../Axios';
import '../styles/Transactions.css'
import Table from '../components/Table'
import NewTransactionBtn from '../components/NewTransactionBtn';
import TransactionsSortButton from '../components/TransactionsSortBtn';
import TransactionsFilterBtn from '../components/TransactionsFilterBtn';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Alert from '@mui/material/Alert';

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [fetchTransactions, setFetchTransactions] = useState(true);
    const [queryParams, setQueryParams] = useSearchParams();

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (fetchTransactions) {
            axios_instance.get("transactions", {
                params: queryParams,
            })
                .then(res => {
                    console.log(res);
                    if (res.status == 200) return res.data;
                    throw new Error("Couldn't fetch transactions")
                })
                .then(data => {

                    if (data.length === 0 && queryParams.size > 0) 
                        setErrorMsg("No transactions match the specified filters");
                    else
                        setErrorMsg("");

                    setTransactions(data)
                })
                .catch(err => console.log(err));

            setFetchTransactions(false);
        }
    }, [fetchTransactions]);

    const refetchTransactions = () => setFetchTransactions(true);

    return (
        <section className="page" id='TransactionsPage'>
            {errorMsg && <Alert className="transactions-alert" onClose={() => { setErrorMsg("") }} severity="error">{errorMsg}</Alert>}

            <header>
                <h1>Transactions</h1>
                <div className="btn-group left">
                    <NewTransactionBtn refetch={refetchTransactions} />

                    <button className='btn icon-btn'>
                        <SummarizeIcon />
                        Report
                    </button>
                </div>
                <div className="btn-group right">
                    <TransactionsSortButton
                        params={queryParams}
                        setParams={setQueryParams}
                        refetch={refetchTransactions} 
                    />

                    <TransactionsFilterBtn
                        params={queryParams}
                        setParams={setQueryParams}
                        refetch={refetchTransactions}
                    />
                </div>
            </header>

            <div className="content-container">
                <div className="content">
                    <Table data={transactions} />
                </div>
            </div>

        </section>
    );
}

export default TransactionsPage;