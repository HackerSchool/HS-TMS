import React from 'react';

import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { createTheme, ThemeProvider } from '@mui/material/styles';


function MultipleSelect({ options, selectedOptions, handleChange }) {
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
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
            <FormControl className='multiple-select' variant='outlined' >
                <Select
                    id="multiple-select"
                    multiple
                    displayEmpty
                    value={selectedOptions}
                    onChange={handleChange}
                    input={<OutlinedInput color='primary' id="select-multiple-chip" />}
                    renderValue={(selected) => (
                        selected.length === 0 ? <em>None</em> :
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    <MenuItem disabled value="">
                        <em>None</em>
                    </MenuItem>
                    {options.map((option) => (
                        <MenuItem
                            key={option.name}
                            value={option.name}
                        >
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </ThemeProvider>

    );
}

export default MultipleSelect;