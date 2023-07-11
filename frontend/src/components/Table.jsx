import React, { useState } from "react";
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
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function createData(date, description, value, projects, nif) {
    return { date, description, value, projects, nif };
}

const rows = [
    createData('01-01-2023', 'Purchase for some in day', 6.0, "Arquimedia/Sweats/MIDI", true),
    createData('03-01-2023', 'Purchase for some in day', 9.0, "Arquimedia/Sweats", true),
    createData('01-03-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", false),
    createData('03-03-2023', 'Purchase for some in day', 3.7, "Arquimedia/Sweats/MIDI", true),
    createData('01-04-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", false),
    createData('03-04-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats", true),
    createData('01-05-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('03-05-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('01-06-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('03-06-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats", true),
    createData('01-07-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", false),
    createData('03-07-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('01-08-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('03-08-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('01-09-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats", true),
    createData('03-09-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", false),
    createData('01-10-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats", true),
    createData('03-10-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
    createData('01-11-2023', 'Purchase for some in day', 16.0, "Arquimedia/Sweats/MIDI", true),
];

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

export default function CustomTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return (
        <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Value (€)</TableCell>
                        <TableCell align="center">Projects</TableCell>
                        <TableCell align="center">NIF</TableCell>
                        <TableCell align="center" padding="none">Receipt</TableCell>
                        <TableCell align="center" padding="none"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(rowsPerPage > 0
                        ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : rows).map((row) => (
                            <TableRow
                                key={`${row.date}+${row.value}+${Math.random()}`}
                            >
                                <TableCell component="th" scope="row" align="center">
                                    {row.date}
                                </TableCell>
                                <TableCell align="center">{row.description}</TableCell>
                                <TableCell align="center">{row.value}</TableCell>
                                <TableCell align="center">{row.projects}</TableCell>
                                <TableCell align="center">{row.nif ? "Yes" : "No"}</TableCell>
                                <TableCell align="center">{row.nif ? <CloudDownloadIcon /> : "-"}</TableCell>
                                <TableCell align="center"><MoreHorizIcon /></TableCell>
                            </TableRow>
                        ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 62.18 * emptyRows }}>
                            <TableCell colSpan={7} />
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[15, 20, 25, { label: 'All', value: -1 }]}
                            colSpan={7}
                            count={rows.length}
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
                </TableFooter>
            </Table>
        </TableContainer>
    );
}