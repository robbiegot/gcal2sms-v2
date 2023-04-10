import { useState, Fragment, useCallback, useRef } from 'react';
import {
    Box, Button, TextField, Typography,  Select, MenuItem, IconButton, Input, Snackbar,
    Dialog, DialogTitle, DialogContent, 
} from '@mui/material';
import { getSession, useSession } from 'next-auth/react';
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import Alert, { AlertProps } from '@mui/material/Alert';
import { DefaultRemindersUser } from '@prisma/client';
import Layout from '../components/Layout';
import SettingsSlider from '../components/SettingsSlider';
import { useRouter } from 'next/router';
import prisma from '../lib/prisma';
import { v4 as randomId } from 'uuid';

interface displayReminder extends Partial<DefaultRemindersUser> {
    editing: boolean;
    timeUnit: string;
    newReminder: boolean;
}

const timeOptions: number[] = [
    ...Array.from({ length: 11 }, (_, i) => i),
    ...Array.from({ length: 2 }, (_, i) => ((i + 1) * 5 + (10))),
    30,
    45,
    60,
    90,
];
const timeUnits: string[] = ['minutes', 'hours', 'days'];



const ConfigureReminders = ({ existingDefaults, session }) => {
    const [reminders, setReminders] = useState(existingDefaults.map((reminder) => ({ ...reminder, editing: false, newReminder: false})));
    const [snackbar, setSnackbar] = useState<Pick<AlertProps, 'children' | 'severity'> | null>(null);
    const previousReminderValue = useRef(null);
    const [editing, setEditing] = useState(false);
       
    const submitData = useCallback(
        async (method: string, info: Partial<displayReminder>) => {
                const updatedReminder = await fetch(`/api/settings-API/reminders`, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(info)
                }).then(async data => {
                    const response = await data.json()
                    if (response.code) { //this means theres a prisma error
                        throw response
                    }
                    return response;
                }).catch(error => {
                    return error;
                })
                console.log('here is the updated reminder', updatedReminder)
                return updatedReminder;
            }, []) 
    const handleSaveReminder = useCallback(
        async (index?) => {
            try {
                const targetReminder = index ? reminders[index] : reminders.filter((r) => r.editing === true)[0];
                console.log('target reminder', reminders)
                console.log(targetReminder)
                if (targetReminder.text === previousReminderValue.current.text  && 
                    targetReminder.time === previousReminderValue.current.time && 
                    targetReminder.timeUnit === previousReminderValue.current.timeUnit) {
                        setSnackbar({ children: 'No Changes were made, please make changes before saving', severity: 'warning' });
                        return;
                    }
                if (targetReminder.text === '') {
                    setSnackbar({ children: 'Please enter text for the reminder', severity: 'warning' });
                    return;
                }
                const response = await submitData("PATCH", targetReminder);
                setReminders(reminders.map((r) => (r.id === response.id ? { ...response, editing: false, newReminder: false } : r)));
                setEditing(false);
                setSnackbar({ children: 'Contact successfully saved', severity: 'success' });
                previousReminderValue.current = null; 
                return response;
            } catch (error) {
                console.log(error)
                setSnackbar({ children: 'There was an issue updating the contact', severity: 'error' });
            }
        },
        [reminders]
    );
    const handleDeleteReminder = useCallback(
        async (index) => {
            const id = reminders[index].id;
            const response = await submitData("DELETE", { id: id });
            if (response.code) {
                if (response.code === 'P2002') {
                    setSnackbar({ children: "there is already a record with that info", severity: 'error' });
                    return;
                }
            }
            setReminders(reminders.filter((r) => r.id !== id));
            setSnackbar({ children: 'Contact successfully deleted', severity: 'success' });
            return response;
        },
        [reminders]
    );
    const handleOpenNewReminder = () => {
        if (reminders.length < 3 && !editing) {
            const newReminder = { id: randomId(), time: 0, timeUnit: 'hours', text: '', editing: true, newReminder: true};
            setReminders((prev) => [...prev, newReminder]);
            previousReminderValue.current = newReminder; 
            setEditing(true); 
        } else {
            if (editing)   {
                setSnackbar({ children: 'You are already editing a reminder', severity: 'error' });
            } 
            if (reminders.length >= 3) {
                setSnackbar({ children: 'You can only have 2 default reminders', severity: 'error' });
            }
        }
        return;
    }
    const handleEditReminder = async (indexToEdit) => {
        if (!editing) {
            setEditing(true);
            setReminders((prev) =>
                prev.map((r, idx) =>{
                    if (idx === indexToEdit) {
                        previousReminderValue.current = {...r};
                        return { ...r, editing: true };
                    }  else {
                        return r
                    }
                })
            );
            
        } else {
            if (editing)   {
                setSnackbar({ children: 'You are already editing a reminder', severity: 'error' });
            } 
        }
        return;
    };
    const handleCancelEditReminder = (indexToCancel) => {
        if (reminders[indexToCancel].newReminder) {
            setReminders((prev) => prev.filter((r, idx) => !r.newReminder));
        } else {
            setReminders((prev) => prev.map((r, idx) => idx === indexToCancel ? {...previousReminderValue.current} : r));
            previousReminderValue.current = null; 
        }
        setEditing(false);
    };
    const router = useRouter();
    const handleCloseDialog = (event, reason) => {
        if (reason && reason == "backdropClick") {
            router.replace('/');
            return;
        }
        return;
    }
    const handleCloseSnackbar = () => setSnackbar(null);

    return (
        <Layout>
            <Dialog
                open={true}
                fullWidth={true}
                maxWidth="xl"
                TransitionComponent={SettingsSlider}
                onClose={handleCloseDialog}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ margin: 'auto', padding: '32px' }}>
                        <Typography variant="h4" gutterBottom>
                            Configure Default Reminders
                        </Typography>
                        {reminders.map((reminder, index) => {
                            const reminderText = reminder.time + ' ' + reminder.timeUnit + ' prior';
                            return (
                                <Fragment key={`reminder-${index}`}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '1em' }}>
                                            {!reminder.editing ? (
                                                    <TextField
                                                        label="Reminder time"
                                                        value={reminderText}
                                                        onChange={(e) => setReminders((prev) => prev.map((r, idx) => idx === index ? { ...r, time: e.target.value } : r))}
                                                        disabled={!reminder.editing}
                                                    />
                                               ) : (
                                                <Box display="flex">
                                                    <Select
                                                        label="Reminder time"
                                                        value={reminder.time}
                                                        size="small"
                                                        variant="standard"
                                                        onChange={(e) =>
                                                            setReminders((prev) =>
                                                                prev.map((r, idx) =>
                                                                    idx === index ? { ...r, time: e.target.value } : r
                                                                )
                                                            )
                                                        }
                                                        sx={{ marginRight: '16px' }}
                                                        disabled={!reminder.editing}
                                                    >
                                                        {timeOptions.map((time) => (
                                                            <MenuItem key={`time-${time}`} value={time}>
                                                                {time}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    <Select
                                                        label="Reminder time"
                                                        value={reminder.timeUnit}
                                                        size="small"
                                                        variant="standard"
                                                        onChange={(e) =>
                                                            setReminders((prev) =>
                                                                prev.map((r, idx) =>
                                                                    idx === index ? { ...r, timeUnit: e.target.value } : r
                                                                )
                                                            )
                                                        }
                                                        sx={{ marginRight: '16px' }}
                                                        disabled={!reminder.editing}
                                                    >
                                                        {timeUnits.map((unit) => (
                                                            <MenuItem key={`unit-${unit}`} value={unit}>
                                                                {unit}
                                                            </MenuItem>

                                                        ))}
                                                    </Select>
                                                </Box>
                                            )}
                                     
                                        <TextField
                                            value={reminder.text}
                                            multiline={true}
                                            variant="standard"
                                            onChange={(e) =>
                                                setReminders((prev) =>
                                                    prev.map((r, idx) =>
                                                        idx === index ? { ...r, text: e.target.value } : r
                                                    )
                                                )
                                            }
                                            sx={{ flexGrow: 1, marginRight: '16px', marginLeft: '16px'}}
                                            disabled={!reminder.editing}
                                        />
                                        {reminder.editing ? (
                                            <Fragment>
                                                <IconButton
                                                    edge="end"
                                                    color="inherit"
                                                    onClick={() => handleSaveReminder(index)}
                                                    sx={{ verticalAlign: 'top' }}
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    color="inherit"
                                                    onClick={() => handleCancelEditReminder(index)}
                                                    sx={{ verticalAlign: 'top' }}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Fragment>
                                        ) : (
                                            <Fragment>
                                                <IconButton
                                                    edge="end"
                                                    color="inherit"
                                                    onClick={() => handleEditReminder(index)}
                                                    sx={{ verticalAlign: 'top' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                edge="end"
                                                color="inherit"
                                                onClick={() => handleDeleteReminder(index)}
                                                sx={{ verticalAlign: 'top' }}
                                                >
                                                    <DeleteIcon />
                                            </IconButton>
                                         </Fragment>
                                        )}
                                    </Box>
                                </Fragment>
                            )
                        })
                        }
                        <Box sx={{ marginTop: '10%' }}>
                            { editing ? (
                                    <Button variant="contained" color="secondary" onClick={() => handleSaveReminder()}>
                                        Save reminder
                                    </Button>
                            ) : (
                                <Button variant="contained" color="primary" onClick={handleOpenNewReminder} style={{ marginTop: '3vh' }}>
                                    Add reminder
                                </Button>
                            )}
                        </Box>
                        {!!snackbar && (
                            <Snackbar
                                open
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                onClose={handleCloseSnackbar}
                                autoHideDuration={6000}
                            >
                                <Alert {...snackbar} onClose={handleCloseSnackbar} />
                            </Snackbar>
                        )}
                    </Box >
                </DialogContent>
            </Dialog>
        </Layout >
    );
};


export async function getServerSideProps({ req, res }) {
    const session = await getSession({ req });
    const minutesToTimeUnitWithoutUnit = (time: number) => {
        if (time / 60 / 24 >= 2) {
            return {
                time: time / 60 / 24,
                timeUnit: 'days'
            }
    
        } else if (time / 60 >= 2 || time / 60 === 1) {
            return {
                time: time / 60,
                timeUnit: 'hours'
            }
        } else {
            return {
                time: time,
                timeUnit: 'minutes'
            }
        }
    };
    
    if (!session) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }

    const reminderData = await prisma.defaultRemindersUser.findMany({
        where: {
            userId: session.user.userId,
        },
    });
    const existingDefaults =  reminderData.map((r) => Object.assign(r, minutesToTimeUnitWithoutUnit(r.time)))

    return {
        props: {
            existingDefaults,
            session: session,
        },
    };
}
export default ConfigureReminders;
