import React from 'react';
import '../styles/Charts.css'
import PrintIcon from '@mui/icons-material/Print';
import LineChart from '../components/LineChart';

function ChartsPage() {
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
            </header>
            <div className="content-container">
                <div className="charts">
                    <LineChart title="Transaction Histogram"/>
                    <LineChart title="Transaction Boxplot"/>
                    <LineChart title="Project Transactions 1"/>
                    <LineChart title="Project Transactions 2"/>
                </div>
            </div>
        </section>
    );
}

export default ChartsPage;