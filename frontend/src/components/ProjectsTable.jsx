import React, { useEffect, useState } from "react";
import MoreOptionsBtn from "./MoreOptionsBtn";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = event => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = event => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = event => {
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
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
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

export default function ProjectsTable({ data, openEditModal, openDeleteModal, loading }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset the page index when the data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

  return (
    <TableContainer className="projects-table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center" padding="none">
              Name
            </TableCell>
            <TableCell align="center">Transactions</TableCell>
            <TableCell align="center">Balance</TableCell>
            <TableCell align="center">Active</TableCell>
            <TableCell align="center" padding="none" width={24}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 &&
            !loading && ( // display message when there's no data to display
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontSize: 18 }}>
                  No projects found
                </TableCell>
              </TableRow>
            )}

          {loading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ border: 0 }}>
                <CircularProgress className="loading-circle large" sx={{ m: 5 }} />
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            (rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map(row => (
              <TableRow key={row.name} hover>
                <TableCell component="th" scope="row" align="center">
                  <span className={row.symbolic ? "symbolic-indicator" : ""}>{row.name}</span>
                </TableCell>
                <TableCell align="center">{row.transaction_count}</TableCell>
                <TableCell align="center">{`${row.balance.toFixed(2)}€`}</TableCell>
                <TableCell align="center">{`${row.active ? "Yes" : "No"}`}</TableCell>
                <TableCell align="center">
                  <MoreOptionsBtn
                    options={[
                      {
                        icon: <EditIcon />,
                        name: "Edit",
                        callback: () => openEditModal(row),
                      },
                      {
                        icon: <DeleteIcon />,
                        name: "Delete",
                        callback: () => openDeleteModal(row),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 62.18 * emptyRows }}>
              <TableCell colSpan={5} />
            </TableRow>
          )}
        </TableBody>
        {!loading && (
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[15, 20, 25, { label: "All", value: -1 }]}
                colSpan={5}
                count={data.length}
                rowsPerPage={rowsPerPage}
                // If the data has been filtered and the current page doesn't exist anymore, pass 0
                // to the TablePagination component while the page hasn't been reset to 0 by the useEffect hook
                page={page < Math.ceil(data.length / rowsPerPage) ? page : 0}
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: false,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}
