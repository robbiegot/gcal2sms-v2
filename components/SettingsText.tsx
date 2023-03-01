import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/system";
import {
    TextField,
    Button,
    FormGroup,
    InputAdornment,
} from '@mui/material';
import { useSession, signIn } from "next-auth/react";
import { TransitionProps } from "@mui/material/transitions";

const SettingsTextField = ({ componentName, readOnlyVal, handleReadOnlyChange, initialValue, submitData }) => {

    const [textSubmission, setTextSubmission] = useState(initialValue);

    const submitTextField = (e, { componentName: textSubmission }) => {
        if (!readOnlyVal && textSubmission !== initialValue) {
            submitData({ componentName: textSubmission })
            handleReadOnlyChange(componentName);
            return;
        }
        handleReadOnlyChange(componentName);
    };

    const onChange = (e) => {
        setTextSubmission(e.target.value);
    };

    const cancelTextField = () => {
        handleReadOnlyChange(componentName)
    };

    return (
        <FormGroup>
            <TextField
                autoFocus
                margin="dense"
                id={componentName}
                label={componentName}
                disabled={readOnlyVal}
                variant={readOnlyVal ? 'filled' : 'outlined'}
                defaultValue={initialValue ? initialValue : ''}
                onChange={(e) => onChange(e)}
                InputProps={{
                    readOnly: readOnlyVal,
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button
                                onClick={() => submitTextField({ componentName: textSubmission })}
                                type="submit"
                                variant="contained">
                                {readOnlyVal ? 'Click To Edit' : 'Submit Change'}
                            </Button>
                            {!readOnlyVal &&
                                <Button
                                    onClick={cancelTextField}
                                    type="button"
                                    variant="contained"
                                    color='warning'
                                    sx={{ ml: '10px' }}
                                >
                                    Cancel
                                </Button>
                            }
                        </InputAdornment>
                    ),
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}

            />
        </FormGroup>
    )
}

export default SettingsTextField