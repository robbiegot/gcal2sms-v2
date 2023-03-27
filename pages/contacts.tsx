import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import libphonenumber from 'google-libphonenumber';
import Layout from '../components/Layout';

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
phoneUtil.formatOutOfCountryCallingNumber(phoneUtil.parse('202-456-1414', 'US'), 'US')

interface Data {
    name: string;
    email: String;
    FormattedPhoneNumber: string;
    sendReminders: Boolean;
    defRmndrStr: string;
    defRmndrTime: number;
};

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    numeric?: boolean;
    width: number;
}

type Sample = [string, string, number, Boolean, string, number];

const sample: readonly Sample[] = [
    ['Jim John', "JimJohn@JoinRight.com", 2015724343, true, "reminder, you have an upcoming appointment0", 36],
    ['Apple And', "Apple@JoinRight.com", 4402079460000, true, "reminder, you have an upcoming appointment0", 36],
    ['Ramona Constantine', "Apple@JoinRight.com", 12341234234, false, "reminder, you have an upcoming appointment0", 36],
];

function createData(
    id: number,
    name: string,
    email: String,
    phoneNumber: number,
    sendReminders: Boolean,
    defRmndrStr: string,
    defRmndrTime: number,
): Data {
    const FormattedPhoneNumber = phoneUtil.formatOutOfCountryCallingNumber(phoneUtil.parse(String(phoneNumber), "US"))
    return { name, email, FormattedPhoneNumber, sendReminders, defRmndrStr, defRmndrTime };
}

const columns: ColumnData[] = [
    {
        width: 200,
        label: 'Name',
        dataKey: 'name',
    },
    {
        width: 120,
        label: 'Email',
        dataKey: 'email',
    },
    {
        width: 120,
        label: 'Phone Number',
        dataKey: 'FormattedPhoneNumber',
        numeric: true,
    },
    {
        width: 120,
        label: 'Send Reminders to this Person?',
        dataKey: 'sendReminders',
        numeric: true,
    },
    {
        width: 120,
        label: 'Default Reminder To Send',
        dataKey: 'defRmndrStr',
        numeric: true,
    },
];

const rows: Data[] = Array.from({ length: 200 }, (_, index) => {
    const randomSelection = sample[Math.floor(Math.random() * sample.length)];
    return createData(index, ...randomSelection);
});

const VirtuosoTableComponents: TableComponents<Data> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
        <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    )),
};

function fixedHeaderContent() {
    return (
        <TableRow>
            {columns.map((column) => (
                <TableCell
                    key={column.dataKey}
                    variant="head"
                    align={column.numeric || false ? 'right' : 'left'}
                    style={{ width: column.width }}
                    sx={{
                        backgroundColor: 'secondary.main',
                    }}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
}

function rowContent(_index: number, row: Data) {
    return (
        <React.Fragment>
            {columns.map((column) => (
                <TableCell
                    key={column.dataKey}
                    align={column.numeric || false ? 'right' : 'left'}
                    sx={{
                        backgroundColor: 'text.disabled',
                    }}
                >
                    {row[column.dataKey]}
                </TableCell>
            ))}
        </React.Fragment>
    );
}

export default function ReactVirtualizedTable() {
    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Paper style={{ marginTop: '2em', height: '50em', width: '85%' }}>
                    <TableVirtuoso
                        data={rows}
                        components={VirtuosoTableComponents}
                        fixedHeaderContent={fixedHeaderContent}
                        itemContent={rowContent}

                    />
                </Paper>
            </div>
        </Layout >
    );
}  