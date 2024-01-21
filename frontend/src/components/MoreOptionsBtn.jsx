import React, { useRef, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";

/**
 *
 * @interface Option = { icon, name, callback }
 * @param {Array} options
 * @param {String} className - classes to apply to the more-options button
 */
function MoreOptionsBtn({ options, className }) {
  const [open, setOpen] = useState(false);
  const handleToggle = () => setOpen(oldValue => !oldValue);
  const handleClose = event => setOpen(false);

  const anchorRef = useRef();

  return (
    <>
      <MoreHorizIcon
        className={className}
        ref={anchorRef}
        onClick={handleToggle}
        sx={{ cursor: "pointer" }}
      />

      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
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
                <MenuList className={`more-options-menu ${className}`}>
                  {options.map(option => {
                    return (
                      <MenuItem
                        className="option"
                        onClick={event => option.callback()}
                        tabIndex={0}
                        key={option.name}
                      >
                        {option.icon}
                        {option.name}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default MoreOptionsBtn;
