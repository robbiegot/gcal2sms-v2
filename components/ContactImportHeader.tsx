import Checkbox from '@mui/joy/Checkbox';
import Link from '@mui/joy/Link';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { visuallyHidden } from "@mui/utils";
import Box from '@mui/joy/Box';


interface Data {
    email: string;
    name: string;
    phoneNumber?: string;
    secondaryEmail?: string;
    tertiaryEmail?: string;
}
interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}
interface ImportContactTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}
type Order = 'asc' | 'desc';

const headCells: readonly HeadCell[] = [
{
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Name',
},
{
    id: 'email',
    numeric: true,
    disablePadding: false,
    label: 'Primary Email',
},
{
    id: 'phoneNumber',
    numeric: true,
    disablePadding: false,
    label: 'Phone Number',
},
{
    id: 'secondaryEmail',
    numeric: true,
    disablePadding: false,
    label: 'Secondary Email',
},
{
    id: 'tertiaryEmail',
    numeric: true,
    disablePadding: false,
    label: 'Tertiary Email',
},
];

export function ImportContactTableHead(props: ImportContactTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
        };
    
    return (
        <thead>
        <tr>
            <th>
            <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                slotProps={{
                input: {
                    'aria-label': 'select all desserts',
                },
                }}
                sx={{ verticalAlign: 'sub' }}
            />
            </th>
            {headCells.map((headCell) => {
            const active = orderBy === headCell.id;
            return (
                <th
                key={headCell.id}
                aria-sort={
                    active
                    ? ({ asc: 'ascending', desc: 'descending' } as const)[order]
                    : undefined
                }
                >
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link
                    underline="none"
                    color="neutral"
                    textColor={active ? 'primary' : undefined}
                    component="button"
                    onClick={createSortHandler(headCell.id)}
                    fontWeight="lg"
                    startDecorator={
                    headCell.numeric ? (
                        <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} />
                    ) : null
                    }
                    endDecorator={
                    !headCell.numeric ? (
                        <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} />
                    ) : null
                    }
                    sx={{
                    '& svg': {
                        transition: '0.2s',
                        transform:
                        active && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                    },
                    '&:hover': { '& svg': { opacity: 1 } },
                    }}
                >
                    {headCell.label}
                    {active ? (
                    <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                    ) : null}
                </Link>
                </th>
            );
            })}
        </tr>
        </thead>
    );
    }  
