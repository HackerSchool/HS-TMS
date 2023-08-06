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

function TransactionsOptionsBtn({ transaction, refetch, openEditModal, openDeleteModal }) {
    const [open, setOpen] = useState(false);
    const handleToggle = () => setOpen(oldValue => !oldValue);
    const handleClose = (event) => setOpen(false);
    
    const anchorRef = useRef();
    
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
                                        tabIndex={0}
                                    >
                                        <EditIcon />
                                        Edit
                                    </MenuItem>
                                    <MenuItem
                                        className='transaction-option'
                                        onClick={(event) => openDeleteModal(transaction)}
                                        tabIndex={0}
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