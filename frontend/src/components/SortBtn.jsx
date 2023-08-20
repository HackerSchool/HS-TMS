import React, { useState, useRef } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SortIcon from '@mui/icons-material/Sort'
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

/**
 * @interface Option - { text, orderBy, order }, example: {text: 'Newest first', orderBy: 'date', order: 'DESC'}
 * with 'orderBy' and 'order' being allowed values by the API 
 * @param {URLSearchParams} params - the current URL params
 * @param {Function} setParams - the function to change the URL params
 * @param {Function} refetch - callback to signal that params have been changed and a content refetch is needed
 * @param {Array} options - Array with all the sorting options, each one following the 'Option' interface
 * @returns a Dropdown with the {options} listed that is synchronized with the URL query params
 */
export default function SortButton({ params, setParams, refetch, options }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(() => {
        let idx = -1;
        if (params.get("orderBy") && params.get("order")) {
            idx = options.findIndex((option) => option.orderBy === params.get("orderBy") &&
                option.order === params.get("order"));
        }
        return idx === -1 ? 0 : idx;
    });

    const handleMenuItemClick = (event, index) => {
        const chosenOption = options[index];

        setParams(oldParams => {
            // If the order we are setting is the default, no need to use query params
            if (chosenOption.orderBy === options[0].orderBy && chosenOption.order === options[0].order) {
                oldParams.delete("orderBy");
                oldParams.delete("order");
                return oldParams;
            }

            return {
                ...Object.fromEntries(oldParams.entries()),
                orderBy: chosenOption.orderBy,
                order: chosenOption.order
            }
        });
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
                                <MenuList
                                    className='sort-menu'
                                    autoFocusItem
                                    variant='menu'
                                >
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option.text}
                                            className='sort-option'
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                            tabIndex={0}
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