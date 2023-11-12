import React, { useRef } from 'react';

import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function SelectDropdown({ options, selectedOptions, handleChange, nullOption = null, multiple=false }) {
    const inputRef = useRef();

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: inputRef.current ? inputRef.current.clientWidth : 250,
                backgroundColor: "var(--cinza-4)",
                color: "#fff"
            },
        },
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: "#fff",
            },
        },
    });


    return (
        <ThemeProvider theme={theme} >
            <FormControl className='select-dropdown' variant='outlined' ref={inputRef} >
                <Select
                    multiple={multiple}
                    displayEmpty={nullOption !== null}
                    value={selectedOptions}
                    onChange={handleChange}
                    input={<OutlinedInput color='primary' />}
                    renderValue={(selected) => {
                        if (multiple) {
                            return selected.length === 0 ? <em>{nullOption}</em> :
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                        }
                        return <Box sx={{ display: 'flex', color: "white" }}>
                            {selected}                     
                        </Box>
                    }}
                    MenuProps={MenuProps}
                >
                    {nullOption && <MenuItem disabled={multiple} value="">
                        <em>{nullOption}</em>
                    </MenuItem>}
                    {options.map((option) => (
                        <MenuItem
                            key={option}
                            value={option}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </ThemeProvider>

    );
}

export default SelectDropdown;