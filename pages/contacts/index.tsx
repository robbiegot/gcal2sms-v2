import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import {
    GridRowsProp, DataGrid, GridColDef, GridToolbar, GridRowId, GridActionsCellItem, GridToolbarContainer,
    GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridRowModel, GridEventListener, GridToolbarQuickFilter,
    GridPreProcessEditCellProps, GridCellParams, GridValueFormatterParams
} from '@mui/x-data-grid';
import libphonenumber from 'google-libphonenumber';
import Layout from '../../components/Layout';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import prisma from '../../lib/prisma';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ContactsEditToolbar from '../../components/ContactsEditToolbar';


export default function ContactsGrid({ contacts }) {
    const { data: session, status } = useSession();
    const [rows, setRows] = useState<GridRowsProp>(contacts);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [snackbar, setSnackbar] = useState<Pick<AlertProps, 'children' | 'severity'> | null>(null);

    const submitData = () => {
        return useCallback(
            async (method, info: GridRowModel | GridRowId) => {
                const updatedInfo = await fetch(`/api/contacts-API/`, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(info)
                }).then(async data => {
                    const response = await data.json(); 
                    if (response.code) { //this means theres an error
                        throw response
                    }
                    return response;
                }).catch(error => {
                    return error;
                })
                return updatedInfo;
            }, [])
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
        processRowDelete(id);
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
    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };
    const processRowUpdate = useCallback(
        async (newRow: GridRowModel) => {
            try {
                const response = await mutateRow("POST", newRow);
                if (!response.id) {
                    throw response;
                }
                setRows(rows.map((row) => (row.id === response.id ? { ...response, isNew: false } : row)));
                setSnackbar({ children: 'Contact successfully saved', severity: 'success' });
                return response;
            } catch (error) {
                throw error;
            }
        },
        [mutateRow, rows]
    );
    const processRowDelete = useCallback(
        async (id: GridRowId) => {
            const response = await mutateRow("DELETE", id);
            console.log('here is the response', response)
            if (response.code) {
                if (response.code === 'P2002') {
                    setSnackbar({ children: "there is already a record with that info", severity: 'error' });
                    return;
                }
            }
            setRows(rows.filter((row) => row.id !== id));
            setSnackbar({ children: 'Contact successfully deleted', severity: 'success' });
            return response;
        },
        [mutateRow, rows]
    );
    const handleProcessRowUpdateError = useCallback((error: any) => {
        if (error.code && error.code === 'P2002') {
            setSnackbar({ children: 'A contact with this info already exists', severity: 'error' });
            return;
        }
        setSnackbar({ children: error.message, severity: 'error' });
    }, []);

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
            type: "number",
            headerAlign: 'left',
            align: 'left',
            hideSortIcons: true,
            preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
                if (!params.props.value) return { ...params.props, error: false };
                const input = params?.props?.value.toString();
                if (input?.length >= 10) {
                    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parse(input, 'US')
                    const hasError = (phoneUtil.isValidNumberForRegion(number, 'US') === false);
                    return { ...params.props, error: hasError };
                }

            },
            valueFormatter: (params: GridValueFormatterParams): any => {
                const input = params?.value?.toString();
                if (input?.length >= 10) {
                    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parse(input, 'US');
                    return phoneUtil.formatInOriginalFormat(number, 'US')
                }
            },
        },
        {
            width: 100,
            headerName: `Send Reminders?`,
            field: 'sendReminders',
            type: 'boolean',
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
                        slots={{ toolbar: ContactsEditToolbar }}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        slotProps={{
                            toolbar: {
                                rows: rows,
                                rowModesModel: rowModesModel,
                                setRows,
                                setRowModesModel,
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                                borderColor: 'primary.light',
                                backgroundColor: 'secondary.light',
                            },
                        }}
                        sx={{
                            '& input[type=number]': {
                                '-moz-appearance': 'textfield'
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                                '-webkit-appearance': 'none',
                                margin: 0
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                                '-webkit-appearance': 'none',
                                margin: 0
                            },
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
};

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
        const contactProps = contacts.map(contact => { return { ...contact, isNew: false } })
        return {
            props: {
                contacts: contactProps,
            },
        }
    } catch (error) {
        return {
            props: {
                contacts: []
            }
        }
    }


}