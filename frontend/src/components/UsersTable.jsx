import React from "react";
import Image from "../components/ImageRenderer"
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BlockIcon from '@mui/icons-material/Block';

export default function UsersTable({ data, loading, openDeleteModal }) {

    return (
        <div style={{ overflow: "hidden", borderRadius: "1rem" }}>
        <TableContainer>
            <Table sx={{ minWidth: 300, width: "100%" }} className="users-table" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Photo</TableCell>
                        <TableCell align="center">Name</TableCell>
                        <TableCell align="center">Username</TableCell>
                        <TableCell align="center" >Status</TableCell>
                        <TableCell align="center" padding="none"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 && !loading && ( // display message when there's no data to display
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ fontSize: 18, border: 0 }}>
                                No Users found
                            </TableCell>
                        </TableRow>
                    )}

                    {loading && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ border: 0 }} >
                                <CircularProgress className="loading-circle large" sx={{ m: 5 }} />
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && data.map((row) => (
                        <TableRow
                            key={`${row.name}+${row.username}+${Math.random()}`}
                            hover
                        >
                            <TableCell component="th" scope="row" align="center">
                                {row.photo ?
                                    <Image
                                        imageData={[row.photo]}
                                        altText={`${row.username}'s photo`}
                                        className="user-photo"
                                    />
                                    : <AccountCircleIcon className="user-photo" />}
                            </TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">{row.username}</TableCell>
                            <TableCell align="center">
                                <span className={row.active ? "active" : "pending"}>
                                    {row.active ? "Active" : "Pending activation"}
                                </span>
                            </TableCell>
                            <TableCell align="center" padding="none">
                                <div style={{ display: "inline-flex", cursor: "pointer" }}
                                    onClick={() => openDeleteModal(row)}
                                >
                                    <BlockIcon />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </div>
    );
}