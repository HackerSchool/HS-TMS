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
                if (res.status === 204) refetchTransactions();
                else throw new Error(`Couldn't delete transaction ${transactionToDelete.id}`)
                /* FIXME */
            });

        setOpenConfirmationModal(false);
    }

    function getTransactionDeletionText() {
        return (
        <div style={{ lineHeight: 1.5 }}>
            <b>Date:</b> {transactionToDelete.date} <br />
            <b>Description:</b> {transactionToDelete.description !== "" ? transactionToDelete.description : "none"} <br />
            <b>Value:</b> {transactionToDelete.value}€ <br />
            <b>Projects:</b> {transactionToDelete.projects ?? "none"} <br />
            <b>NIF:</b> {transactionToDelete.has_nif ? "Yes" : "No"} <br />
            <b>Receipt:</b> {transactionToDelete.has_file ?
                <div style={{ display: 'inline-flex', alignItems: 'center'}}>Yes <DownloadIcon id={transactionToDelete.id} /></div> : "No"}
        </div>
        )
    }

    // Alerts to display
    const [errorMsg, setErrorMsg] = useState("");

    // To fetch transactions when needed
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

    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    const launchEditModal = useCallback((transaction) => {
        setTransactionToEdit(transaction);
        setOpenEditModal(true);
    });

    const launchConfirmationModal = useCallback((transaction) => {
        setTransactionToDelete(transaction);
        setOpenConfirmationModal(true);
    });

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
                    <Table
                        data={transactions}
                        refetch={refetchTransactions}
                        openEditModal={launchEditModal}
                        openDeleteModal={launchConfirmationModal}
                    />
                </div>
            </div>

            {transactionToEdit && <TransactionEditModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                transaction={transactionToEdit}
                refetch={refetchTransactions}
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