import React, { useState } from "react";
import axios_instance from "../Axios";
import { showErrorMsg } from "../Alerts";
import MoreOptionsBtn from "./MoreOptionsBtn";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                <KeyboardArrowLeft />
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                <KeyboardArrowRight />
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
}

export function DownloadIcon({id}) {
    const [pending, setPending] = useState(false);

    return (
        <div className="receipt-download-icon-container" style={{ cursor: "pointer", position: "relative" }}
            onClick={() => {
                setPending(true);
                axios_instance.get(`transactions/download/${id}`, {
                    responseType: 'blob',
                })
                .then(res => {
                    if (res.status === 200) return res.data;
                    else throw new Error();
                })
                .then(data => {
                    // create file link in browser's memory
                    const href = URL.createObjectURL(data);

                    const link = document.createElement("a");
                    link.href = href;
                    link.setAttribute('download', `receipt${id}.pdf`)
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();

                    document.body.removeChild(link);
                    URL.revokeObjectURL(href)
                })
                .catch(err => {
                    if (err.handledByMiddleware) return;

                    let msg = "Couldn't download the receipt"
                    if (err.reqTimedOut)
                        msg += ". Request timed out";
                    else if (err.response)
                        msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;
    
                    showErrorMsg(msg);
                })
                .finally(() => setPending(false));
            }}
        >
        {pending ? 
            <CircularProgress className="loading-circle small" />
            : <RequestPageIcon className="receipt-download-icon" />
        }
        </div>
    )
}

export default function TransactionsTable({ data, openEditModal, openDeleteModal, loading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function formatString(str) {
        let newStr = str;

        if (str.length > 40) {
            newStr = str.slice(0,40);
            newStr += "...";
        }
        return newStr;
    }

    return (
        <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" padding="none">Date</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Value</TableCell>
                        <TableCell align="center" padding="none">Balance</TableCell>
                        <TableCell align="center">Projects</TableCell>
                        <TableCell align="center" padding="none">NIF</TableCell>
                        <TableCell align="center" padding="none">Receipt</TableCell>
                        <TableCell align="center" padding="none"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 && !loading && ( // display message when there's no data to display
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{fontSize: 18}}>
                                No transactions found
                            </TableCell>
                        </TableRow>
                    )}

                    {loading && (
                    <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ border: 0 }} >
                            <CircularProgress className="loading-circle large" sx={{ m: 5}} />
                        </TableCell>
                    </TableRow>
                    )}

                    {!loading && (rowsPerPage > 0
                        ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : data).map((row) => (
                            <TableRow
                                key={`${row.date}+${row.value}+${Math.random()}`}
                                hover
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.date}
                                </TableCell>
                                <TableCell align="center">
                                    {row.description ? formatString(row.description) : "-"}
                                </TableCell>
                                <TableCell align="center">{`${row.value.toFixed(2)}€`}</TableCell>
                                <TableCell align="center">{`${row.balance.toFixed(2)}€`}</TableCell>
                                <TableCell align="center">
                                    {row.projects ? formatString(row.projects) : "-"}
                                </TableCell>
                                <TableCell align="center">{row.has_nif ? "Yes" : "No"}</TableCell>
                                <TableCell align="center">
                                    {row.has_file ? <DownloadIcon id={row.id} /> : "-"}
                                </TableCell>
                                <TableCell align="center">
                                    <MoreOptionsBtn
                                        options={[
                                            {
                                                icon: <EditIcon />,
                                                name: "Edit",
                                                callback: () => openEditModal(row)
                                            },
                                            {
                                                icon: <DeleteIcon />,
                                                name: "Delete",
                                                callback: () => openDeleteModal(row)
                                            }
                                        ]}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 62.18 * emptyRows }}>
                            <TableCell colSpan={8} />
                        </TableRow>
                    )}
                </TableBody>
                {!loading && <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[15, 20, 25, { label: 'All', value: -1 }]}
                            colSpan={8}
                            count={data.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                    'aria-label': 'rows per page',
                                },
                                native: false,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>}
            </Table>
        </TableContainer>
    );
}