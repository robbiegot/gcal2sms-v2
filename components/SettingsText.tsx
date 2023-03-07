import React, { useRef, useState, useEffect, EventHandler, FormEvent } from "react";
import {
    TextField,
    Button,
    InputAdornment,
    FormGroup,
} from '@mui/material';


const SettingsTextField = ({ componentName, readOnlyVal, handleReadOnlyChange, initialValue, submitData }) => {
    const inputRef = useRef(componentName);

    return (
        <TextField
            autoFocus
            margin="dense"
            type='text'
            inputRef={inputRef}
            id={componentName}
            label={componentName}
            disabled={readOnlyVal}
            variant={readOnlyVal ? 'filled' : 'outlined'}
            defaultValue={initialValue ? initialValue : ''}
            InputProps={{
                readOnly: readOnlyVal,
                endAdornment: (
                    <InputAdornment position="end">
                        <Button
                            onClick={(e) => {
                                if (!readOnlyVal && inputRef.current.value !== initialValue) {
                                    console.log("hello", inputRef)
                                    submitData(e, componentName, inputRef.current.value)
                                };
                                handleReadOnlyChange(componentName);
                            }}
                            type="submit"
                            variant="contained">
                            {readOnlyVal ? 'Click To Edit' : 'Submit Change'}
                        </Button>
                        {!readOnlyVal &&
                            <Button
                                onClick={() => handleReadOnlyChange(componentName)}
                                type="button"
                                variant="contained"
                                color='warning'
                                sx={{ ml: '10px' }}
                            >
                                Cancel
                            </Button>
                        }
                    </InputAdornment >
                ),
            }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        />

    )
}

export default SettingsTextField