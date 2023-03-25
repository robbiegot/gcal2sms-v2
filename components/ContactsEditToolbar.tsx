import {
    GridRowsProp, GridToolbarContainer,
    GridRowModesModel, GridRowModes, GridToolbarQuickFilter, GridValidRowModel,
} from '@mui/x-data-grid';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { v4 as randomId } from 'uuid';

interface ContactsEditToolbarProps {
    rows: GridValidRowModel[];
    rowModesModel: GridRowModesModel;
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

export default function ContactsEditToolbar(props: ContactsEditToolbarProps) {
    const { rowModesModel, rows, setRows, setRowModesModel } = props;
    const handleClick = async () => {
        if (!rows.every((row) => row.isNew === false)) {
            return;
        }
        const id = randomId();
        setRows(() => [...rows, {
            id,
            name: '',
            email: '',
            phoneNumber: '',
            customReminderText: '',
            sendReminders: true,
            isNew: true
        }]);
        setRowModesModel(() => ({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };


    return (
        <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {(rows.every((row) => row.isNew === false)) ?
                <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                    Add record
                </Button>
                : <Button disabled>Enter New Contact</Button>}
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
}