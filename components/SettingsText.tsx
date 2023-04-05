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


const SettingsTextField = ({ info, handleReadOnlyChange,  submitData, handleTyping}) => {
    const { readOnly, value, submissionStatus, label, componentName } = info;
    const inputRef = useRef(componentName);

    return (
        <TextField
            autoFocus
            margin="dense"
            type='text'
            inputRef={inputRef}
            id={componentName}
            label={label}
            disabled={readOnly}
            variant={readOnly ? 'filled' : 'outlined'}
            value={value ? value : ''}
            onChange={(e) => handleTyping(e, componentName)}
            InputProps={{
                readOnly: readOnly,
                endAdornment: (
                    <InputAdornment position="end">
                        {submissionStatus && <CheckIcon color="success" />}
                        <Button
                            onClick={(e) => {
                                if (!readOnly) {
                                    submitData(componentName, inputRef.current.value)
                                };
                                handleReadOnlyChange(componentName);
                            }}
                            type="submit"
                            variant="contained">
                            {readOnly ? 'Click To Edit' : 'Submit Change'}
                        </Button>
                        {!readOnly &&
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