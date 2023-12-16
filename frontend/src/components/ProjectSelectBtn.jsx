import React, { useState, useRef, useEffect } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SortIcon from '@mui/icons-material/Sort'
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import '../styles/SelectBtn.css'

export default function ProjectSelectBtn({ projectList, loading, updateProjectID, defaultIdx }){
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([{ name: "loading..." }]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const anchorRef = useRef(null);
    
    const handleMenuItemClick = (event, index) => {
        const chosenOption = options[index];
        updateProjectID(chosenOption.id);
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    useEffect(() => {
        if (loading) return;

        const activeProjects = projectList.filter(proj => proj.active);
        if (activeProjects.length > 0) {
            setOptions(activeProjects);
            // guarantee the defaultIdx is in range
            const chosenIdx = defaultIdx % activeProjects.length;
            setSelectedIndex(chosenIdx);
            updateProjectID(activeProjects[chosenIdx].id);
        } else {
            setOptions([{ name: "No projects" }]);
            updateProjectID(-1);
        }
    }, [projectList, loading]);

    return (
        <> 
            <button ref={anchorRef} className='btn icon-btn sort-btn' onClick={handleToggle}>
                <SortIcon />
                {`${options[selectedIndex].name}`}
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
                            transformOrigin: placement = 'center top',
                        }}
                    >
                        <Paper sx={{ backgroundColor: "transparent" }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList className='select-menu' id="select-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option.name}
                                            className='select-option'
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option.name}
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