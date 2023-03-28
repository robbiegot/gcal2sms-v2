import { useState, Fragment } from 'react';
import {
    Box, Button, TextField, Typography, TextareaAutosize, Select, MenuItem, IconButton, Input
} from '@mui/material';
import { getSession } from 'next-auth/react';
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';

const ConfigureReminders = ({ defaultReminders }) => {
    const timeOptions = [
        ...Array.from({ length: 11 }, (_, i) => i),
        ...Array.from({ length: 2 }, (_, i) => ((i + 1) * 5 + (10))),
        30,
        45,
        60,
        90,
    ];

    const timeUnits = ['minutes', 'hours', 'days'];
    const [reminders, setReminders] = useState(defaultReminders.map((reminder) => ({ ...reminder, editing: false })));
    const [newReminder, setNewReminder] = useState({ time: '', text: '' });

    const handleAddReminder = () => {
        if (newReminder.time !== '' && newReminder.text !== '') {
            setReminders([...reminders, newReminder]);
            setNewReminder({ time: '', text: '' });
        }
    };
    const handleEditReminder = (indexToEdit) => {
        setReminders((prev) =>
            prev.map((r, idx) =>
                idx === indexToEdit ? { ...r, editing: true } : r
            )
        );
    };
    const handleCancelEditReminder = (indexToCancel) => {
        setReminders((prev) =>
            prev.map((r, idx) =>
                idx === indexToCancel ? { ...r, editing: false } : r
            )
        );
    };



    const handleDeleteReminder = (indexToDelete) => {
        setReminders((prev) => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleSave = () => {
        // Save reminders to the server
        console.log('Reminders to save:', reminders);
    };

    return (
        <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '32px' }}>
            <Typography variant="h4" gutterBottom>
                Configure Default Reminders
            </Typography>
            {reminders.map((reminder, index) => (
                <div style={{ display: 'flex', marginTop: '10px' }} >
                    <Fragment key={`reminder-${index}`}>
                        <Select
                            value={reminder.time}
                            onChange={(e) =>
                                setReminders((prev) =>
                                    prev.map((r, idx) =>
                                        idx === index ? { ...r, time: e.target.value } : r
                                    )
                                )
                            }
                            sx={{ marginRight: '16px', minWidth: '75px' }}
                            readOnly={!reminder.editing}
                            disabled={!reminder.editing}

                        >
                            {timeOptions.map((time) => (
                                <MenuItem key={`time-${time}`} value={time}>
                                    {time}
                                </MenuItem>
                            ))}
                        </Select>
                        <Select
                            value={reminder.timeUnit}
                            onChange={(e) =>
                                setReminders((prev) =>
                                    prev.map((r, idx) =>
                                        idx === index ? { ...r, timeUnit: e.target.value } : r
                                    )
                                )
                            }
                            sx={{ marginRight: '16px', minWidth: '120px' }}
                            readOnly={!reminder.editing}
                            disabled={!reminder.editing}

                        >
                            {timeUnits.map((unit) => (
                                <MenuItem key={`unit-${unit}`} value={unit}>
                                    {unit}
                                </MenuItem>

                            ))}
                        </Select>
                        <Box sx={{ display: 'inline-block', marginRight: '16px', minWidth: '300px' }}>
                            <Input
                                minRows={3}
                                maxRows={6}
                                value={reminder.text}
                                variant="contained"
                                onChange={(e) =>
                                    setReminders((prev) =>
                                        prev.map((r, idx) =>
                                            idx === index ? { ...r, text: e.target.value } : r
                                        )
                                    )
                                }
                                readOnly={!reminder.editing}
                                disabled={!reminder.editing}
                                color="secondary"
                                placeholder="Reminder text"
                                style={{ width: '100%', padding: '5px', resize: 'none' }}
                            />
                        </Box>
                        {reminder.editing ? (
                            <Fragment>
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    onClick={() => handleSave(index)}
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
                    </Fragment>
                </div>
            ))
            }
            <Box sx={{ display: 'flex', marginTop: '16px' }}>
                <TextField
                    label="New reminder time (minutes)"
                    type="number"
                    value={newReminder.time}
                    onChange={(e) =>
                        setNewReminder({ ...newReminder, time: e.target.value })
                    }
                    sx={{ marginRight: '16px' }}
                />
                <TextField
                    label="New reminder text"
                    value={newReminder.text}
                    multiline={true}
                    fullWidth={true}
                    onChange={(e) =>
                        setNewReminder({ ...newReminder, text: e.target.value })
                    }
                />
            </Box>
            <Button
                variant="text"
                onClick={handleAddReminder}
                sx={{ marginLeft: '16px' }}
            >
                Add reminder
            </Button>
            <Box sx={{ marginTop: '32px' }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save reminders
                </Button>
            </Box>
        </Box >
    );
};


export default ConfigureReminders;

export async function getServerSideProps({ req, res }) {
    const session = await getSession({ req });

    const defaultReminders = [
        // Replace with actual data fetched from the server
        { time: 10, timeUnit: 'minutes', text: 'This is a reminder', },
        { time: 5, text: 'days', text: 'Another reminder' },
    ];


    return {
        props: {
            defaultReminders,
        },
    };
}