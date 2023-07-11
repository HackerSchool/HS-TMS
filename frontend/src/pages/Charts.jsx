import React from 'react';
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
                <div className="content">
                    <LineChart title="1"/>
                    <LineChart title="2"/>
                    <LineChart title="3"/>
                    <LineChart title="4"/>
                    <LineChart title="5"/>
                    <LineChart title="6"/>
                </div>
            </div>
        </section>
    );
}

export default ChartsPage;