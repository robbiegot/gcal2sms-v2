import React, { useRef, useState, useEffect, EventHandler, FormEvent } from "react";
import { useRouter } from "next/router";
import { green } from '@mui/material/colors';
import {
    TextField,
    Button,
    InputAdornment,
    FormGroup,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';


const SettingsTextField = ({ componentName, readOnlyVal, handleReadOnlyChange, initialValue, submitData, submissionStatus }) => {
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
            defaultValue={readOnlyVal ? undefined : initialValue}
            variant={readOnlyVal ? 'filled' : 'outlined'}
            value={readOnlyVal ? initialValue : undefined}
            InputProps={{
                readOnly: readOnlyVal,
                endAdornment: (
                    <InputAdornment position="end">
                        {submissionStatus && <CheckIcon color="success" />}
                        <Button
                            onClick={(e) => {
                                if (!readOnlyVal && inputRef.current.value !== initialValue) {
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
                                X
                            </Button>
                        }
                    </InputAdornment >
                ),
            }}
        />
    )
}

export default SettingsTextField