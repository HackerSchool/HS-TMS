import React from 'react';
import '../styles/Transactions.css'
import Table from '../components/Table'
import AddIcon from '@mui/icons-material/Add';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';

function TransactionsPage() {
    return (
        <section className="page" id='TransactionsPage'>
            <header>
                <h1>Transactions</h1>
                <div className="btn-group left">
                    <button className='btn icon-btn'>
                        <AddIcon />
                        New
                    </button>
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
                    <button className='btn icon-btn' id='filter'>
                        <TuneIcon />
                        Filter
                    </button>
                </div>
            </header>

            <div className="content-container">
                <div className="content">
                    <Table />
                </div>
            </div>

        </section>
    );
}

export default TransactionsPage;