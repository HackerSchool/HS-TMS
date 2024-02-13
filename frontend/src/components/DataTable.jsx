import React, { useEffect, useState } from "react";
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

export default function DataTable({
  data,
  dataToRow,
  noDataText,
  headRow,
  pagination,
  loading,
  className = "",
}) {
  const [page, setPage] = useState(pagination ? 0 : -1);
  const [rowsPerPage, setRowsPerPage] = useState(pagination ? 15 : -1);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = !pagination
    ? 0
    : page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - data.length)
      : 0;

  const colCount = headRow.props.children.length;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset the page index when the data changes
  useEffect(() => {
    if (pagination) {
      setPage(0);
    }
  }, [data]);

  const tableBody = loading ? (
    <TableRow>
      <TableCell colSpan={colCount} align="center" sx={{ border: 0 }}>
        <CircularProgress className="loading-circle large" sx={{ m: 5 }} />
      </TableCell>
    </TableRow>
  ) : data.length === 0 ? ( // display message when there's no data to display
    <TableRow>
      <TableCell colSpan={colCount} align="center" sx={{ fontSize: 18 }}>
        {noDataText}
      </TableCell>
    </TableRow>
  ) : (
    <>
      {(rowsPerPage > 0
        ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : data
      ).map(row => dataToRow(row))}
      {emptyRows > 0 && (
        <TableRow style={{ height: 62.18 * emptyRows }}>
          <TableCell colSpan={colCount} />
        </TableRow>
      )}
    </>
  );

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="data table" className={`data-table ${className}`}>
        <TableHead>{headRow}</TableHead>
        <TableBody>{tableBody}</TableBody>
        {pagination && !loading && (
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[15, 20, 25, { label: "All", value: -1 }]}
                colSpan={colCount}
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
