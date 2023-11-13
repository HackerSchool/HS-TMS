import React, { useState, useRef } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SortIcon from '@mui/icons-material/Sort'
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import '../styles/SelectBtn.css'

const options=[
    {text: 'Civic Years', type:'civic'},
    {text: 'Academic Years', type:'academic'},
]

export default function TypeOfYearBtn({setTypeOfYear,refetch}){
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleMenuItemClick = (event, index) => {
        const chosenOption = options[index];
        setTypeOfYear(chosenOption.type);
        refetch();
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    return (
        <>
            <button ref={anchorRef} className='btn icon-btn sort-btn' onClick={handleToggle}>
                <SortIcon />
                {`${options[selectedIndex].text}`}
                <ArrowDropDownIcon />
            </button>

            <Popper
                sx={{ zIndex: 1, width: anchorRef.current?.offsetWidth - 20 }}
                open={open}
                anchorEl={anchorRef.current}
                placement='bottom'
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
                                <MenuList className='select-menu' id="select-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option.text}
                                            className='select-option'
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option.text}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );

}