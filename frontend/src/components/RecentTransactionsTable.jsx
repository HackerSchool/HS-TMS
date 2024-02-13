import React from "react";
import DataTable from "./DataTable";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export default function RecentTransactionsTable({ data, loading }) {
  function formatString(str) {
    let newStr = str;

    if (str.length > 40) {
      newStr = str.slice(0, 40);
      newStr += "...";
    }
    return newStr;
  }

  function dataToRow(transaction) {
    return (
      <TableRow key={transaction.id} hover>
        <TableCell component="th" scope="row" align="center">
          {transaction.date}
        </TableCell>
        <TableCell align="center">{`${transaction.value.toFixed(2)}€`}</TableCell>
        <TableCell align="center">{`${transaction.balance.toFixed(2)}€`}</TableCell>
        <TableCell align="center">
          {transaction.projects ? formatString(transaction.projects) : "-"}
        </TableCell>
      </TableRow>
    );
  }

  const headRow = (
    <TableRow>
      <TableCell align="center" padding="none">
        Date
      </TableCell>
      <TableCell align="center" padding="none">
        Value
      </TableCell>
      <TableCell align="center" padding="none">
        Balance
      </TableCell>
      <TableCell align="center">Projects</TableCell>
    </TableRow>
  );

  return (
    <DataTable
      data={data}
      dataToRow={dataToRow}
      noDataText="No transactions found"
      headRow={headRow}
      pagination={false}
      loading={loading}
      className="latest-transactions-table"
    />
  );
}
