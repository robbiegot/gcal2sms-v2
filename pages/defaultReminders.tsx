import { useState, Fragment, useCallback } from 'react';
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

interface displayReminder extends Partial<DefaultRemindersUser> {
    editing: boolean;
    timeUnit: string;
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



const ConfigureReminders = ({ existingDefaults }) => {
    const { data: session, status } = useSession();
    const [reminders, setReminders] = useState(existingDefaults.map((reminder) => ({ ...reminder, editing: false })));
    const [newReminder, setNewReminder] = useState({ time: 0, timeUnit: 'hours', text: '', editing: false });
    const [snackbar, setSnackbar] = useState<Pick<AlertProps, 'children' | 'severity'> | null>(null);
    const [selectedReminderOld, setSelectedReminderOld] = useState<string | null>(null);
    
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
    const processReminderUpdate = useCallback(
        async (index?) => {
            try {
                const reminderToSend = (index !== undefined) ? reminders[index] : newReminder; //if index is undefined, we are creating a new reminder
                const response = await submitData("PATCH", reminderToSend);
                if (index === undefined) {
                    setReminders((prev) => [...prev, { ...response, editing: false }]);
                    setNewReminder({ time: 0, timeUnit: 'hours', text: '', editing: false }); 
                } else {
                    setReminders(reminders.map((r) => (r.id === response.id ? { ...response, editing: false } : r)));
                    setSelectedReminderOld(null); 
                }
                setSnackbar({ children: 'Contact successfully saved', severity: 'success' });
                return response;
            } catch (error) {
                setSnackbar({ children: 'There was an issue updating the contact', severity: 'error' });
            }
        },
        [reminders, newReminder]
    );
    const processReminderDelete = useCallback(
        async (id) => {
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
    const handleCloseSnackbar = () => setSnackbar(null);

    const handleCancelNewReminder = () => {
        setNewReminder({ time: 0, timeUnit: 'hours', text: '', editing: false });
    }
    const handleOpenNewReminder = () => {
        if (reminders.length < 3) {
            setNewReminder({ time: 0, timeUnit: 'hours', text: '', editing: true });
        } else {
            setSnackbar({ children: 'You can only have 3 default reminders', severity: 'error' });
        }
        return;
    }
    const handleSaveNewReminder = async () => {
        if (newReminder.time !== undefined && newReminder.text !== '') {
            await processReminderUpdate();
        }
        return;
    }
    const handleSaveUpdateReminder = async (indexToSave) => {
        await processReminderUpdate(indexToSave);
        setSelectedReminderOld(null); 
        return;
    }
    const handleEditReminder = async (indexToEdit) => {
        let selectedReminder;
        setReminders((prev) =>
            prev.map((r, idx) =>{
                if (idx === indexToEdit) {
                    selectedReminder = { ...r, editing: true }
                    return selectedReminder;
                }  else {
                    return r
                }
                })
        );
        await setSelectedReminderOld(JSON.stringify(selectedReminder));
        return;
    };
    const handleCancelEditReminder = (indexToCancel) => {
        setReminders((prev) =>
            prev.map((r, idx) =>
                idx === indexToCancel ? { ...JSON.parse(selectedReminderOld), editing: false } : r
            )
        );
        setSelectedReminderOld(null); 
    };
    const handleDeleteReminder = async (indexToDelete) => {
        await processReminderDelete(reminders[indexToDelete].id);
    };
    const router = useRouter();
    const handleCloseDialog = (event, reason) => {
        if (reason && reason == "backdropClick") {
            router.replace('/');
            return;
        }
        return;
    }
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
                                        <Box display="flex" sx={{ minWidth: '15%', maxWidth: '15%' }}>
                                            {!reminder.editing ? (
                                                <Box>
                                                    <TextField
                                                        label="Reminder time"
                                                        value={reminderText}
                                                        onChange={(e) => setReminders((prev) => prev.map((r, idx) => idx === index ? { ...r, time: e.target.value } : r))}
                                                        disabled={!reminder.editing}
                                                    />
                                                </Box>) : (
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
                                        </Box>
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
                                                    onClick={() => handleSaveUpdateReminder(index)}
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
                                            <IconButton
                                                edge="end"
                                                color="inherit"
                                                onClick={() => handleEditReminder(index)}
                                                sx={{ verticalAlign: 'top' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            edge="end"
                                            color="inherit"
                                            onClick={() => handleDeleteReminder(index)}
                                            sx={{ verticalAlign: 'top' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Fragment>
                            )
                        })
                        }
                        <Box sx={{ marginTop: '10%' }}>
                            {newReminder.editing ? (
                                <>
                                    <Typography variant="h4">
                                        Add New Reminder
                                    </Typography>
                                    <Box sx={{ display: 'flex', marginBottom: '16px' }}>
                                        <Box display="flex" sx={{ minWidth: '13vw', maxWidth: '13vw' }}>
                                            <Select
                                                label="Reminder time"
                                                value={newReminder.time}
                                                size="small"
                                                onChange={(e) =>
                                                    setNewReminder({ ...newReminder, time: e.target.value})
                                                }
                                                sx={{ marginRight: '16px', minWidth: '3vw' }}
                                            >
                                                {timeOptions.map((time) => (
                                                    <MenuItem key={`time-${time}`} value={time}>
                                                        {time}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <Select
                                                value={newReminder.timeUnit}
                                                size="small"
                                                onChange={(e) => {
                                                    console.log(newReminder)
                                                    return setNewReminder({ ...newReminder, timeUnit: e.target.value })
                                                }
                                                }
                                                sx={{ marginRight: '16px' }}
                                            >
                                                {timeUnits.map((unit) => (
                                                    <MenuItem key={`unit-${unit}`} value={unit}>
                                                        {unit}
                                                    </MenuItem>

                                                ))}
                                            </Select>
                                        </Box>
                                        <TextField
                                            label="Reminder text"
                                            value={newReminder.text}
                                            multiline={true}
                                            fullWidth={true}
                                            onChange={(e) =>
                                                setNewReminder({ ...newReminder, text: e.target.value })
                                            }
                                            InputProps={{
                                                endAdornment:
                                                    <IconButton
                                                        edge="end"
                                                        onClick={handleCancelNewReminder}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>

                                            }}
                                        />
                                    </Box>
                                    <Button variant="contained" color="secondary" onClick={handleSaveNewReminder}>
                                        Save reminder
                                    </Button>
                                </>
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
                destination: '/signin',
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
        },
    };
}
export default ConfigureReminders;
