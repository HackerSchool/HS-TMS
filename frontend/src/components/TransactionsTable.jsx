import React from "react";
import MoreOptionsBtn from "./MoreOptionsBtn";
import ReceiptDownloadIcon from "./ReceiptDownloadIcon";
import DataTable from "./DataTable";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TransactionsTable({ data, openEditModal, openDeleteModal, loading }) {
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
        <TableCell align="center">
          {transaction.description ? formatString(transaction.description) : "-"}
        </TableCell>
        <TableCell align="center">{`${transaction.value.toFixed(2)}€`}</TableCell>
        <TableCell align="center">{`${transaction.balance.toFixed(2)}€`}</TableCell>
        <TableCell align="center">
          {transaction.projects ? formatString(transaction.projects) : "-"}
        </TableCell>
        <TableCell align="center">{transaction.has_nif ? "Yes" : "No"}</TableCell>
        <TableCell align="center">
          {transaction.has_file ? <ReceiptDownloadIcon id={transaction.id} /> : "-"}
        </TableCell>
        <TableCell align="center">
          <MoreOptionsBtn
            options={[
              {
                icon: <EditIcon />,
                name: "Edit",
                callback: () => openEditModal(transaction),
              },
              {
                icon: <DeleteIcon />,
                name: "Delete",
                callback: () => openDeleteModal(transaction),
              },
            ]}
          />
        </TableCell>
      </TableRow>
    );
  }

  const headRow = (
    <TableRow>
      <TableCell align="center" padding="none">
        Date
      </TableCell>
      <TableCell align="center">Description</TableCell>
      <TableCell align="center">Value</TableCell>
      <TableCell align="center" padding="none">
        Balance
      </TableCell>
      <TableCell align="center">Projects</TableCell>
      <TableCell align="center" padding="none">
        NIF
      </TableCell>
      <TableCell align="center" padding="none">
        Receipt
      </TableCell>
      <TableCell align="center" padding="none" width={24}></TableCell>
    </TableRow>
  );

  return (
    <DataTable
      data={data}
      dataToRow={dataToRow}
      noDataText="No transactions found"
      headRow={headRow}
      pagination={true}
      loading={loading}
      className="transactions-table"
    />
  );
}
