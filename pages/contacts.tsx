import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import {
    GridRowsProp, DataGrid, GridColDef, GridToolbar, GridRowId, GridActionsCellItem, GridToolbarContainer,
    GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridRowModel, GridEventListener, GridToolbarQuickFilter,
    GridPreProcessEditCellProps, GridCellParams, GridValueFormatterParams
} from '@mui/x-data-grid';
import { Button } from '@mui/material';
import libphonenumber from 'google-libphonenumber';
import Layout from '../components/Layout';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { v4 as randomId } from 'uuid';
import prisma from '../lib/prisma';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';


const rawRows: GridRowsProp = [
    { id: 1, name: 'Jim John', email: "JimJohn@JoinRight.com", phoneNumber: "2015724343", sendReminders: true, customReminderText: "reminder, you have an upcoming appointment0", customReminderTime: 36 },
    { id: 2, name: 'Anni Hello', email: "Annie@JoinRight.com", phoneNumber: "9737630275", sendReminders: false, customReminderText: "reminder, you have an upcoming appointment0", customReminderTime: 36 },
    { id: 3, name: 'Ben Johb', email: "11@JoinRight.com", phoneNumber: "4165872222", sendReminders: true, customReminderText: "reminder, you have an upcoming appointment0", customReminderTime: 36 },
    { id: 4, name: 'Bob Lob', email: "22@JoinRight.com", phoneNumber: "9737630275", sendReminders: false, customReminderText: "reminder, you have an upcoming appointment0", customReminderTime: 36 },

];


interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
}


export default function FullFeaturedCrudGrid() {
    const { data: session, status } = useSession();
    const [rows, setRows] = useState<GridRowsProp>(rawRows);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [snackbar, setSnackbar] = useState<Pick<AlertProps, 'children' | 'severity'> | null>(null);

    //functionality to reload data when a field has been changed

    const submitData = () => {
        return useCallback(
            (contact: GridRowModel) => {
                return fetch(`/api/contacts-API/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contact)
                }).then(res => res.json()
                ).then(newContact => newContact
                ).catch(Error => new Error("Data is incorrectly formatted."));
            },
            [])
    }
    const mutateRow = submitData();


    const handleCloseSnackbar = () => setSnackbar(null);


    const handleRowEditStart = (
        params: GridRowParams,
        event: MuiEvent<React.SyntheticEvent>,
    ) => {
        event.defaultMuiPrevented = true;
    };

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = useCallback(
        async (newRow: GridRowModel) => {
            const response = await mutateRow(newRow);
            setSnackbar({ children: 'Contact successfully saved', severity: 'success' });
            return response;
        },
        [mutateRow],
    );

    const handleProcessRowUpdateError = useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: 'error' });
    }, []);

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'actions',
            type: 'actions',
            width: 80,
            cellClassName: 'actions',
            hideable: false,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="secondary"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="secondary"
                    />,
                ];
            },
        },
        {
            width: 200,
            headerName: 'Name',
            field: 'name',
            editable: true,
        },
        {
            width: 200,
            headerName: 'Email',
            field: 'email',
            editable: true,
            preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
                const re =
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                const hasError = !re.test(String(params.props.value).toLowerCase());

                return { ...params.props, error: hasError };
            },
        },
        {
            width: 140,
            headerName: 'Phone Number',
            field: 'phoneNumber',
            editable: true,
            preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
                try {
                    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
                    const hasError = (phoneUtil.isValidNumberForRegion(phoneUtil.parse(params.props.value, 'US'), 'US') === false);
                    return { ...params.props, error: hasError };
                } catch {
                    return { ...params.props, error: true };
                }
            },
            valueFormatter: ({ value }) => {
                const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
                return phoneUtil.formatOutOfCountryCallingNumber(phoneUtil.parse(value, 'US'), 'US');
            },
        },
        {
            width: 100,
            headerName: `Send Reminders?`,
            field: 'sendReminders',
            type: 'boolean',
            editable: true,
        },

        {
            width: 500,
            headerName: 'Custom Reminder Text?',
            field: 'customReminderText',
            editable: true,
        },
        {
            width: 500,
            headerName: 'Custom Reminder Time?',
            field: 'customReminderTime',
            editable: true,
        },

    ];

    return (
        <Layout>
            <div style={{ display: 'flex', height: '50%', justifyContent: 'center' }}>
                <Box style={{ marginTop: '2em', height: '45em', width: '85%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={handleRowModesModelChange}
                        onRowEditStart={handleRowEditStart}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        slots={{ toolbar: EditToolbar }}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        slotProps={{
                            toolbar: {
                                setRows,
                                setRowModesModel,
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                                borderColor: 'primary.light',
                                backgroundColor: 'secondary.light',
                            },
                        }}
                        sx={{
                            "& .MuiDataGrid-booleanCell": {
                                "&[data-value='false']": {
                                    color: 'warning.main',
                                },
                                "&[data-value='true']": {
                                    color: 'background.default',
                                },
                            },
                            "& .MuiDataGrid-columnHeaderTitle": {
                                overflow: "visible",
                                lineHeight: "1.43rem",
                                whiteSpace: "normal",
                            },
                            "& .MuiInput-root": {
                                // color: "secondary.dark",
                                borderColor: 'secondary.dark',
                                border: 3,

                                backgroundColor: 'secondary.light',
                                "&:hover": {
                                    color: "secondary.dark",
                                    backgroundColor: "primary.dark",
                                    outline: "none",
                                },
                                "&:focus": {
                                    outline: "none",
                                }
                            },

                            border: 2,
                            backgroundColor: 'secondary.light',
                            borderColor: 'primary.main',
                            '& .MuiDataGrid-cell:hover': {

                            },
                            '& .Mui-error': {
                                backgroundColor: `rgb(126,10,15)`,
                                color: 'white',
                            },
                        }}
                    />
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
            </div>
        </Layout>
    );
}


export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return {
            props: {
                contacts: []
            }
        };
    }
    try {
        const { contacts } = await prisma.user.findUnique({
            where: {
                email: session.user.email
            },
            include: {
                contacts: true
            }
        });
        return {
            props: {
                contacts: contacts,
            },
        }
    } catch (error) {
        console.log('theres been an error in settings 325', error)
        return {
            props: {
                contacts: []
            }
        }
    }


}