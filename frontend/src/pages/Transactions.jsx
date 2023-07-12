import React, { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom"
import axios_instance from '../Axios';
import '../styles/Transactions.css'
import Table from '../components/Table'
import NewTransactionBtn from '../components/NewTransactionBtn';
import TransactionsFilterBtn from '../components/TransactionsFilterBtn';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SortIcon from '@mui/icons-material/Sort';

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [fetchTransactions, setFetchTransactions] = useState(true);
    const [queryParams, setQueryParams] = useSearchParams();

    useEffect(() => {
        if (fetchTransactions) {
            // FIXME - use query params
            axios_instance.get("transactions", {
                params: queryParams,
            })
                .then(res => {
                    console.log(res);
                    if (res.status == 200) return res.data;
                    throw new Error("Couldn't fetch transactions")
                })
                .then(data => setTransactions(data))
                .catch(err => console.log(err));

            setFetchTransactions(false);
        }
    }, [fetchTransactions]);

    // useEffect(() => {
    //     setFetchTransactions(true);
    // }, [queryParams])

    const refetchTransactions = () => setFetchTransactions(true);

    return (
        <section className="page" id='TransactionsPage'>
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
                    <button className='btn icon-btn' id='sorted-by'>
                        <SortIcon />
                        Sorted by: Most Recent
                    </button>

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