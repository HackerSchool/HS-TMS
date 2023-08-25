import React, { useRef, useState } from 'react';
import axios_instance from '../Axios';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

function TransactionsOptionsBtn({ transaction, refetch, openEditModal }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef();
    const handleToggle = () => setOpen(oldValue => !oldValue);
    const handleClose = (event) => setOpen(false);

    function deleteTransaction() {
        if (!confirm(`Do you wish to permanently delete transaction ${transaction.id}`
            + (transaction.has_file ? `, along with its corresponding receipt?` : `?`)))
            return;

        axios_instance.delete(`transactions/${transaction.id}`)
            .then(res => {
                if (res.status === 204) refetch();
                else throw new Error(`Couldn't delete transaction ${transaction.id}`)
                /* FIXME */
            })
    }

    return (
        <>
            <MoreHorizIcon ref={anchorRef} onClick={handleToggle} sx={{ cursor: 'pointer' }} />

            <Popper
                sx={{ zIndex: 1 }}
                open={open}
                anchorEl={anchorRef.current}
                placement='bottom-end'
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement = 'center top',
                        }}
                    >
                        <Paper sx={{ backgroundColor: "transparent" }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList className='transactions-options-menu'>
                                    <MenuItem
                                        className='transaction-option'
                                        onClick={(event) => openEditModal(transaction)}
                                    >
                                        <EditIcon />
                                        Edit
                                    </MenuItem>
                                    <MenuItem
                                        className='transaction-option'
                                        onClick={(event) => deleteTransaction()}
                                    >
                                        <DeleteIcon />
                                        Delete
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

export default TransactionsOptionsBtn;