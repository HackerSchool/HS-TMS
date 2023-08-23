import React, { useEffect, useState, useCallback } from 'react';
import '../styles/Dashboard.css'
import chart from '../assets/chart.png'
import axios_instance from '../Axios';
import { showErrorMsg, showSuccessMsg } from "../Alerts"
import DashboardCard from '../components/DashboardCard';
import RecentTransactionsTable from '../components/RecentTransactionsTable';
import NewReminderBtn from '../components/NewReminderBtn';
import ReminderEditModal from '../components/ReminderEditModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Reminder from '../components/Reminder';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CircularProgress from '@mui/material/CircularProgress'

// Format dates as "YYYY-MM-DD"
const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${year}-${month}-${day}`;
};

function DashboardPage() {

    // Treasury overview stats
    const [totalBalance, setTotalBalance] = useState();
    const [activeProjects, setActiveProjects] = useState();
    const [transactionsLastMonth, setTransactionsLastMonth] = useState();
    const [authorizedUsersNumber, setAuthorizedUsersNumber] = useState();

    // active projects
    useEffect(() => {
        axios_instance.get("projects")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => {
                const activeProjCount = data.reduce((count, proj) => {
                    if (proj.active === true) return count + 1;
                    return count;
                }, 0);

                setActiveProjects(activeProjCount);
            })
            .catch(err => {
                let msg = "Couldn't fetch active projects";
                if (err.response) msg += `. Status code: ${err.response.status}`

                showErrorMsg(msg);
            });
    }, []);

    // Transactions last month
    useEffect(() => {
        const lastMonthDate = new Date();
        lastMonthDate.setDate(lastMonthDate.getDate() - 30);

        axios_instance.get("transactions", {
            params: {
                initialDate: formatDate(lastMonthDate),
                finalDate: formatDate(new Date())
            }
        })
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setTransactionsLastMonth(data.length))
            .catch(err => {
                let msg = "Couldn't fetch transactions done in the last 30 days";
                if (err.response) msg += `. Status code: ${err.response.status}`

                showErrorMsg(msg);
            });
    }, []);
    
    // Authorized members
    useEffect(() => {
        axios_instance.get("users")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setAuthorizedUsersNumber(data.length))
            .catch(err => {
                let msg = "Couldn't fetch authorized users";
                if (err.response) msg += `. Status code: ${err.response.status}`

                showErrorMsg(msg);
            });
    }, []);

    // Reminders
    const [reminders, setReminders] = useState([]);
    const [remindersLoading, setRemindersLoading] = useState(false);
    const [fetchReminders, setFetchReminders] = useState(true);

    const refetchReminders = useCallback(() => setFetchReminders(true));

    useEffect(() => {
        if (fetchReminders) {
            setRemindersLoading(true);

            axios_instance.get("reminders")
                .then(res => {
                    if (res.status === 200) return res.data;
                    else throw new Error();
                })
                .then(data => setReminders(data))
                .catch(err => {
                    let msg = "Couldn't fetch reminders";
                    if (err.response) msg += `. Status code: ${err.response.status}`
    
                    showErrorMsg(msg);
                })
                .finally(() => setRemindersLoading(false));

            setFetchReminders(false);
        }
    }, [fetchReminders]);

    // Balance chart
    const [chartData, setChartData] = useState();
    
    // Transactions to display on the recent transactions table
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    useEffect(() => {
        axios_instance.get("transactions", {
            params: { limit: 10 }
        })
            .then(res => {
                if (res.status === 200) return res.data;
                else throw new Error();
            })
            .then(data => {
                setTransactions(data);
                setTotalBalance(data[0]?.balance ?? 0);
            })
            .catch(err => {
                let msg = "Couldn't fetch latest transactions";
                if (err.response) msg += `. Status code: ${err.response.status}`

                showErrorMsg(msg);
            })
            .finally(() => setTransactionsLoading(false));
    }, []);


    // Reminder Deletion
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState();

    function onDeleteCancelation() {
        setOpenConfirmationModal(false);
    }

    function onDeleteConfirmation() {
        axios_instance.delete(`reminders/${reminderToDelete.id}`)
            .then(res => {
                if (res.status === 204) {
                    showSuccessMsg("Reminder deleted successfully");
                    refetchReminders();
                }
                else throw new Error();
            })
            .catch(err => {
                showErrorMsg(`Couldn't delete reminder ${reminderToDelete.id}`);
            });

        setOpenConfirmationModal(false);
    }

    // Callback passed to the reminder to open its delete modal
    const launchConfirmationModal = useCallback((reminder) => {
        setReminderToDelete(reminder);
        setOpenConfirmationModal(true);
    });

    // Reminder editing
    const [openEditModal, setOpenEditModal] = useState(false);
    const [reminderToEdit, setReminderToEdit] = useState();

    // Callback passed to the reminder to open its edit modal
    const launchEditModal = useCallback((reminder) => {
        setReminderToEdit(reminder);
        setOpenEditModal(true);
    });


    return (
        <section className="page" id='DashboardPage'>
            <div className="dashboard-container">
            <div className="dashboard-row">
                <div className="dashboard-item" id='dashboard-treasury-overview'>
                    <h3 className='dashboard-item-title'>Treasury Overview</h3>
                    <div className="dashboard-item-content">
                        <div className="dashboard-card-row">
                            <DashboardCard
                                mainText={`€ ${totalBalance ?? "?"}`}
                                subText="Total balance"
                                green
                                bolderMain
                            />
                            <DashboardCard
                                headingText={activeProjects ?? "?"}
                                mainText="Active"
                                subText="Projects"
                                icon={<TaskAltIcon />}
                            />
                        </div>
                        <div className="dashboard-card-row">
                            <DashboardCard
                                headingText={transactionsLastMonth ?? "?"}
                                mainText="Transactions"
                                subText='in the past 30 days'
                                smallerMain
                            />
                            <DashboardCard
                                headingText={authorizedUsersNumber ?? "?"}
                                mainText={authorizedUsersNumber === 1 ? "Person" : "People"}
                                subText="in the system"
                                icon={<ManageAccountsIcon />}
                            />
                        </div>
                    </div>
                </div>

                <hr className='vl' />

                <div className="dashboard-item" id='dashboard-reminders'>
                    <div className="reminders-title-group">
                        <h3 className='dashboard-item-title'>Reminders</h3>
                        <NewReminderBtn refetch={refetchReminders} />
                    </div>
                    <div className="dashboard-item-content">
                        <div className="reminders-container">
                            {remindersLoading && 
                                <CircularProgress 
                                    className='loading-circle large'
                                    sx={{ alignSelf: "center", m: "auto" }}
                                />}

                            {!remindersLoading && (reminders.length === 0 ? "No reminders found" :
                                reminders.map((reminder, idx, arr) => {
                                    return (
                                        <div className='reminder-container' key={idx}>
                                        <Reminder
                                            reminder={reminder}
                                            openEditModal={launchEditModal}
                                            openDeleteModal={launchConfirmationModal}
                                            />
                                        {(idx < arr.length - 1 || arr.length === 1) && <hr /> }
                                        </div>
                                    )
                                }))
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-row last">
                <div className="dashboard-item" id='dashboard-balance'>
                    <h3 className='dashboard-item-title'>Balance over the last 30 days</h3>
                    <div className="dashboard-item-content">
                        <img src={chart} alt="Balance chart" style={{ maxHeight: "95%" }}/>
                    </div>
                </div>

                <hr className='vl' />

                <div className="dashboard-item" id='dashboard-latest-transactions'>
                    <h3 className='dashboard-item-title'>Latest Transactions</h3>
                    <div className="dashboard-item-content">
                        <RecentTransactionsTable
                            data={transactions}
                            loading={transactionsLoading}
                        />
                    </div>
                </div>
            </div>
            </div>

            {reminderToEdit && <ReminderEditModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                reminder={reminderToEdit}
                refetch={refetchReminders}
            />}

            {reminderToDelete && <ConfirmationModal
                open={openConfirmationModal}
                title={"Do you wish to permanently delete the following reminder?"}
                content={<Reminder reminder={reminderToDelete} hideOptions />}
                onCancel={onDeleteCancelation} 
                onConfirm={onDeleteConfirmation}
            />}

        </section>
    );
}

export default DashboardPage;