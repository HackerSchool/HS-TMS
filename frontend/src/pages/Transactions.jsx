import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom"
import axios_instance from '../Axios';
import '../styles/Transactions.css'
import Table, { DownloadIcon } from '../components/Table'
import NewTransactionBtn from '../components/NewTransactionBtn';
import TransactionsSortButton from '../components/TransactionsSortBtn';
import TransactionsFilterBtn from '../components/TransactionsFilterBtn';
import TransactionEditModal from '../components/TransactionEditModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Alert from '@mui/material/Alert';

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [fetchTransactions, setFetchTransactions] = useState(true);
    const [queryParams, setQueryParams] = useSearchParams();

    // Transaction Edit Modal
    const [openEditModal, setOpenEditModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState();

    // Transaction Deletion
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState();

    function onDeleteCancelation() {
        setOpenConfirmationModal(false);
    }

    function onDeleteConfirmation() {
        axios_instance.delete(`transactions/${transactionToDelete.id}`)
            .then(res => {
                if (res.status === 204) {
                    setSuccessMsg("Transaction deleted successfully");
                    refetchTransactions();
                }
                else throw new Error();
            })
            .catch(err => {
                setErrorMsg(`Couldn't delete transaction ${transactionToDelete.id}`)
            });

        setOpenConfirmationModal(false);
    }

    function getTransactionDeletionText() {
        return (
        <div style={{ lineHeight: 1.5 }}>
            <b>Date:</b> {transactionToDelete.date} <br />
            <b>Value:</b> {transactionToDelete.value}€ <br />
            <b>Projects:</b> {transactionToDelete.projects ?? "none"} <br />
            <b>NIF:</b> {transactionToDelete.has_nif ? "Yes" : "No"} <br />
            <b>Receipt:</b> {transactionToDelete.has_file ?
                <div style={{ display: 'inline-flex', alignItems: 'center'}}>Yes <DownloadIcon id={transactionToDelete.id} /></div> : "No"}<br />
            <b>Description:</b> {transactionToDelete.description !== "" ? transactionToDelete.description : "none"} 
        </div>
        )
    }

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // To show loading state while fetching transactions
    const [loading, setLoading] = useState(false);

    // To fetch transactions when needed
    useEffect(() => {
        if (fetchTransactions) {
            setLoading(true);

            axios_instance.get("transactions", {
                params: queryParams,
            })
                .then(res => {
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
                .catch(err => {
                    let msg = "Couldn't fetch transactions";
                    if (err.response) msg += `. Status code: ${err.response.status}`

                    setErrorMsg(msg);
                })
                .finally(() => setLoading(false));

            setFetchTransactions(false);
        }
    }, [fetchTransactions]);

    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    // list of all existing projects for child components to use
    const [projectsList, setProjectsList] = useState([]);

    // fetch all projects everytime the page is opened
    useEffect(() => {
        axios_instance.get("projects")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error();
            })
            .then(data => setProjectsList(data))
            .catch(err => {
                let msg = "Couldn't fetch projects";
                if (err.response) msg += `. Status code: ${err.response.status}`;

                setErrorMsg(msg);
            });
    }, []);

    // Callback passed to the table to open a transaction's edit modal
    const launchEditModal = useCallback((transaction) => {
        setTransactionToEdit(transaction);
        setOpenEditModal(true);
    });

    // Callback passed to the table to open a transaction's delete modal
    const launchConfirmationModal = useCallback((transaction) => {
        setTransactionToDelete(transaction);
        setOpenConfirmationModal(true);
    });

    return (
        <section className="page" id='TransactionsPage'>
            {errorMsg && <Alert className="transactions-alert" onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>}
            {successMsg && <Alert className="transactions-alert" onClose={() => setSuccessMsg("")} severity="success">{successMsg}</Alert>}

            <header>
                <h1>Transactions</h1>
                <div className="btn-group left">
                    <NewTransactionBtn
                        projectsList={projectsList}
                        refetch={refetchTransactions}
                    />

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
                        projectsList={projectsList}
                    />
                </div>
            </header>

            <div className="content-container">
                <div className="content">
                    <Table
                        data={transactions}
                        refetch={refetchTransactions}
                        openEditModal={launchEditModal}
                        openDeleteModal={launchConfirmationModal}
                        loading={loading}
                    />
                </div>
            </div>

            {transactionToEdit && <TransactionEditModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                transaction={transactionToEdit}
                refetch={refetchTransactions}
                projectsList={projectsList}
            />}

            {transactionToDelete && <ConfirmationModal
                open={openConfirmationModal}
                title={"Do you wish to permanently delete the following transaction"
                + (transactionToDelete.has_file ? ", along with its corresponding receipt?" : "?")}
                content={getTransactionDeletionText()}
                onCancel={onDeleteCancelation}
                onConfirm={onDeleteConfirmation}
            />}

        </section>
    );
}

export default TransactionsPage;