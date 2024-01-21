import React, { useState, useRef, useEffect } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";

export default function DropdownBtn({
  icon,
  options,
  defaultIndex,
  onOptionSelection,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  // guarantee the selectedIndex is in range
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex % options.length);
  const anchorRef = useRef(null);

  const handleMenuItemClick = (event, index) => {
    if (loading) return;
    if (selectedIndex === index) {
      setOpen(false);
      return;
    }

    const chosenOption = options[index];
    onOptionSelection(chosenOption);
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    setOpen(false);
  };

  useEffect(() => {
    const chosenIdx = defaultIndex % options.length;
    const chosenOption = options[chosenIdx];
    onOptionSelection(chosenOption);
    setSelectedIndex(chosenIdx);
    setOpen(false);
  }, [options]);

  return (
    <>
      <button ref={anchorRef} className="btn icon-btn dropdown-btn" onClick={handleToggle}>
        {icon}
        {`${options[selectedIndex].name}`}
        <ArrowDropDownIcon />
      </button>

      <Popper
        sx={{
          zIndex: 1,
          width: anchorRef.current?.offsetWidth - 20,
          transition: "width 0s ease-in-out 1s",
        }}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom"
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: (placement = "center top"),
            }}
          >
            <Paper sx={{ backgroundColor: "transparent" }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList className="dropdown-menu" autoFocusItem variant="menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.name}
                      className="dropdown-option"
                      selected={index === selectedIndex}
                      onClick={event => handleMenuItemClick(event, index)}
                    >
                      <Typography variant="inherit" noWrap>
                        {option.name}
                      </Typography>
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
