import React from "react";
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

export default function RecentTransactionsTable({ data, loading }) {
    const rowsPerPage = 3;

    // Fill with empty rows if there are less that "rowsPerPage" transactions
    const emptyRows = Math.max(0, rowsPerPage - data.length);

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
            <Table sx={{ minWidth: 300, width: "100%" }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" padding="none">Date</TableCell>
                        <TableCell align="center" padding="none">Value</TableCell>
                        <TableCell align="center" padding="none">Balance</TableCell>
                        <TableCell align="center" >Projects</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 && !loading && ( // display message when there's no data to display
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ fontSize: 18, border: 0}}>
                                No transactions found
                            </TableCell>
                        </TableRow>
                    )}

                    {loading && (
                    <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ border: 0 }} >
                            <CircularProgress className="loading-circle large" sx={{ m: 5}} />
                        </TableCell>
                    </TableRow>
                    )}

                    {!loading && data.map((row) => (
                            <TableRow
                                key={`${row.date}+${row.value}+${Math.random()}`}
                                hover
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.date}
                                </TableCell>
                                <TableCell align="center">{`${row.value}€`}</TableCell>
                                <TableCell align="center">{`${row.balance}€`}</TableCell>
                                <TableCell align="center">
                                    {row.projects ? formatString(row.projects) : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    {!loading && emptyRows > 0 && (
                        <TableRow style={{ height: 30 * emptyRows }}>
                            <TableCell colSpan={4} sx={{border:0}} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}