import React from "react";
import MoreOptionsBtn from "./MoreOptionsBtn";
import DataTable from "./DataTable";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ProjectsTable({ data, openEditModal, openDeleteModal, loading }) {
  function dataToRow(project) {
    return (
      <TableRow key={project.name} hover>
        <TableCell component="th" scope="row" align="center">
          <span className={project.symbolic ? "symbolic-indicator" : ""}>{project.name}</span>
        </TableCell>
        <TableCell align="center">{project.transaction_count}</TableCell>
        <TableCell align="center">{`${project.balance.toFixed(2)}€`}</TableCell>
        <TableCell align="center">{`${project.active ? "Yes" : "No"}`}</TableCell>
        <TableCell align="center">
          <MoreOptionsBtn
            options={[
              {
                icon: <EditIcon />,
                name: "Edit",
                callback: () => openEditModal(project),
              },
              {
                icon: <DeleteIcon />,
                name: "Delete",
                callback: () => openDeleteModal(project),
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
        Name
      </TableCell>
      <TableCell align="center">Transactions</TableCell>
      <TableCell align="center">Balance</TableCell>
      <TableCell align="center">Active</TableCell>
      <TableCell align="center" padding="none" width={24}></TableCell>
    </TableRow>
  );

  return (
    <DataTable
      data={data}
      dataToRow={dataToRow}
      noDataText="No projects found"
      headRow={headRow}
      pagination={true}
      loading={loading}
      className="projects-table"
    />
  );
}
