import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css'
import axios_instance from '../Axios';
import DashboardCard from '../components/DashboardCard';
import RecentTransactionsTable from '../components/RecentTransactionsTable';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PersonIcon from '@mui/icons-material/Person';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';

function DashboardPage() {

    // Projects overview stats
    const [totalBalance, setTotalBalance] = useState();
    const [activeProjects, setActiveProjects] = useState();
    const [transactionsLastMonth, setTransactionsLastMonth] = useState();
    const [authorizedUsersNumber, setAuthorizedUsersNumber] = useState();
    
    // Reminders
    const [reminders, setReminders] = useState([]);
    const [remindersLoading, setRemindersLoading] = useState(true);

    useEffect(() => {
        axios_instance.get("reminders")
            .then(res => {
                if (res.status === 200) return res.data;
                else throw new Error();
            })
            .then(data => setReminders(data)) // FIXME
            .catch(err => {
                console.log(err); // FIXME
            })
            .finally(() => setRemindersLoading(false));
    })

    // Balance chart
    const [chartData, setChartData] = useState();
    
    // Transactions to display on the recent transactions table
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    useEffect(() => {
        axios_instance.get("transactions")
            .then(res => {
                if (res.status === 200) return res.data;
                else throw new Error();
            })
            .then(data => setTransactions(data.slice(0,4))) // FIXME
            .catch(err => {
                console.log(err); // FIXME
            })
            .finally(() => setTransactionsLoading(false));
    })



    return (
        <section className="page" id='DashboardPage'>
            <div className="dashboard-row">
                <div className="dashboard-item" id='dashboard-project-overview'>
                    <h3 className='dashboard-item-title'>Projects Overview</h3>
                    <div className="dashboard-item-content">
                        <div className="dashboard-card-row">
                            <DashboardCard
                                mainText="€ 1000"
                                subText="Total balance"
                                green
                                bolderMain
                            />
                            <DashboardCard
                                headingText="8"
                                mainText="Active"
                                subText="Projects"
                                icon={<TaskAltIcon />}
                            />
                        </div>
                        <div className="dashboard-card-row">
                            <DashboardCard
                                headingText="3"
                                mainText="Transactions"
                                subText='in the past month'
                                smallerMain
                            />
                            <DashboardCard
                                headingText="60"
                                mainText="Active"
                                subText="members"
                                icon={<PersonIcon />}
                            />
                        </div>
                    </div>
                </div>

                <hr className='vl' />

                <div className="dashboard-item" id='dashboard-reminders'>
                    <div className="reminders-title-group">
                        <h3 className='dashboard-item-title'>Reminders</h3>
                        <NotificationAddIcon sx={{ cursor: 'pointer' }} />
                    </div>
                    <div className="dashboard-item-content">
                        No reminders found
                    </div>
                </div>
            </div>

            <div className="dashboard-row last">
                <div className="dashboard-item" id='dashboard-balance'>
                    <h3 className='dashboard-item-title'>Balance over the last 30 days</h3>
                    <div className="dashboard-item-content"></div>
                </div>

                <hr className='vl' />

                <div className="dashboard-item" id='dashboard-recent-transactions'>
                    <h3 className='dashboard-item-title'>Recent Transactions</h3>
                    <div className="dashboard-item-content">
                        <RecentTransactionsTable
                            data={transactions}
                            loading={transactionsLoading}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;