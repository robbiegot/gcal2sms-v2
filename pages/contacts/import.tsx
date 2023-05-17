import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { StyledEngineProvider, CssVarsProvider } from '@mui/joy/styles';
import Layout from '../../components/Layout';
import { ImportContactTableHead } from '../../components/ContactImportHeader';
import { ImportContactToolbar } from '../../components/ContactImportToolbar';
import { getSession } from 'next-auth/react';
import { google } from 'googleapis';

interface Data {
    email: string;
    name: string;
    phoneNumber?: string;
    secondaryPhoneNumber?: string;
    secondaryEmail?: string;
    tertiaryEmail?: string;
}

interface Contact {
  resourceName?: string;
  names?: Array<{ displayName?: string }>;
  emailAddresses?: Array<{ value?: string }>;
  phoneNumbers?: Array<{ value?: string, canonicalForm?:string }>;
}
interface ContactsProps {
  contacts: Contact[];
}

function labelDisplayedRows({
  from,
  to,
  count,
}: {
  from: number;
  to: number;
  count: number;
}) {
  return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

function descendingComparator<T>(orderBy: keyof T, a?: T, b?: T, ) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (
    a?: { [key in Key]: string },
    b?: { [key in Key]: string }
  ) => number {
    return (a, b) => {
      if (a[orderBy] === undefined && b[orderBy] === undefined) {
        return 0;
      }
      if (a[orderBy] === undefined) {
        return 1;
      }
      if (b[orderBy] === undefined) {
        return -1;
      }
  
      return order === "desc"
        ? descendingComparator(orderBy, a, b)
        : -descendingComparator(orderBy, a, b);
    };
}

function stableSort<T>(array: readonly T[], comparator: (a?: T, b?: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function TableSortAndSelection({contacts, session}) {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('name');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);


  const rows = contacts; 

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any, newValue: number | null) => {
    setRowsPerPage(parseInt(newValue!.toString(), 10));
    setPage(0);
  };

  const getLabelDisplayedRowsTo = () => {
    if (rows.length === -1) {
      return (page + 1) * rowsPerPage;
    }
    return rowsPerPage === -1
      ? rows.length
      : Math.min(rows.length, (page + 1) * rowsPerPage);
  };

  const isSelected = (name: string) => selected.indexOf(name) == -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Layout>
    <StyledEngineProvider injectFirst>
    <CssVarsProvider>
    <Sheet
          variant="outlined"
          sx={{ display:'inline-block', marginLeft: '50px', marginRight: '50px', boxShadow: "sm", borderRadius: "sm", justifyContent: "center" }}
        >
      <ImportContactToolbar numSelected={selected.length} />
      <Table
        aria-labelledby="tableTitle"
        hoverRow
        sx={{
          '--TableCell-headBackground': 'transparent',
          '--TableCell-selectedBackground': (theme) =>
            theme.vars.palette.info.softBg,
          '& thead th:nth-child(1)': {
            width: '40px',
          },
          '& thead th:nth-child(2)': {
            width: '30%',
          },
          '& tr > *:nth-child(n+3)': { textAlign: 'right' },
        }}
      >
        <ImportContactTableHead
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={rows.length}
        />
        <tbody>
          {stableSort(rows, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => {
              const isItemSelected = isSelected(row.name);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <tr
                  onClick={(event) => handleClick(event, row.name)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.name}
                  style={
                    isItemSelected
                      ? ({
                          '--TableCell-dataBackground':
                            'var(--TableCell-selectedBackground)',
                          '--TableCell-headBackground':
                            'var(--TableCell-selectedBackground)',
                        } as React.CSSProperties)
                      : {}
                  }
                >
                  <th scope="row">
                    <Checkbox
                      defaultChecked
                      checked={isItemSelected}
                      slotProps={{
                        input: {
                          'aria-labelledby': labelId,
                        },
                      }}
                      sx={{ verticalAlign: 'top' }}
                    />
                  </th>
                  <th id={labelId} scope="row">
                    {row.name}
                  </th>
                  <td>{row.email}</td>
                  <td>{row.phoneNumber}</td>
                  <td>{row.secondaryEmail}</td>
                  <td>{row.tertiaryEmail}</td>
                </tr>
              );
            })}
          {emptyRows > 0 && (
            <tr
              style={
                {
                  height: `calc(${emptyRows} * 40px)`,
                  '--TableRow-hoverBackground': 'transparent',
                } as React.CSSProperties
              }
            >
              <td colSpan={6} />
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <FormControl orientation="horizontal" size="sm">
                  <FormLabel>Rows per page:</FormLabel>
                  <Select onChange={handleChangeRowsPerPage} id="select-rows-page" defaultValue={rowsPerPage} >
                    <Option value={5}>5</Option>
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                  </Select>
                </FormControl>
                <Typography textAlign="center" sx={{ minWidth: 80 }}>
                  {labelDisplayedRows({
                    from: rows.length === 0 ? 0 : page * rowsPerPage + 1,
                    to: getLabelDisplayedRowsTo(),
                    count: rows.length === -1 ? -1 : rows.length,
                  })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="sm"
                    color="neutral"
                    variant="outlined"
                    disabled={page === 0}
                    onClick={() => handleChangePage(page - 1)}
                    sx={{ bgcolor: 'background' }}
                  >
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    color="neutral"
                    variant="outlined"
                    disabled={
                      rows.length !== -1
                        ? page >= Math.ceil(rows.length / rowsPerPage) - 1
                        : false
                    }
                    onClick={() => handleChangePage(page + 1)}
                    sx={{ bgcolor: 'background' }}
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </Box>
              </Box>
            </td>
          </tr>
        </tfoot>
      </Table>
    </Sheet>
      </CssVarsProvider>
      </StyledEngineProvider >
      </Layout>
  );


  

}

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      }
    };
  }

  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: session.googleRefreshToken });
  const people = google.people({ version: 'v1', auth: oauth2Client });
  const fetchContacts = async () => {
    const contacts: Contact[] = [];
    let nextPageToken: string | undefined;
    do {
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses,phoneNumbers',
        pageToken: nextPageToken,
      });

      nextPageToken = response.data.nextPageToken;

      if (response.data.connections) {
        contacts.push(...response.data.connections);
      }
    } while (nextPageToken);

    return contacts;
  };
  
  const data = await fetchContacts();
  
  const formattedContacts = data.map((contact) => {
    const name = contact.names ? contact.names[0].displayName : '';
    const email = contact.emailAddresses ? contact.emailAddresses[0].value : '';
    const phoneNumber = (contact.phoneNumbers && contact.phoneNumbers.length > 0) ? contact.phoneNumbers[0].canonicalForm : '';
    const secondaryPhoneNumber = (contact.phoneNumbers && contact.phoneNumbers.length > 1) ? contact.phoneNumbers[1].canonicalForm : '';
    const secondaryEmail = (contact.emailAddresses && contact.emailAddresses.length > 1) ? contact.emailAddresses[1].value : '';
    const tertiaryEmail = (contact.emailAddresses && contact.emailAddresses.length > 2) ? contact.emailAddresses[2].value : '';
    return {
      name,
      email,
      phoneNumber,
      secondaryPhoneNumber,
      secondaryEmail,
      tertiaryEmail,
    };
  })

  const contacts = formattedContacts.filter((contact) => (
    typeof contact.phoneNumber === 'string' 
    && contact.name.length > 0 
    && contact.email.length > 0
    && contact.phoneNumber.length > 0))
  
  return {
    props: {
      contacts
    },
  };

}