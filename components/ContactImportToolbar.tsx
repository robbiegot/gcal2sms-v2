import Checkbox from '@mui/joy/Checkbox';
import Link from '@mui/joy/Link';
import Tooltip from '@mui/joy/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { visuallyHidden } from "@mui/utils";
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';

interface ImportContactToolbarProps {
    numSelected: number;
}


export function ImportContactToolbar(props: ImportContactToolbarProps) {
    const { numSelected } = props;
    return (
  
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: 'background',
          }),
          borderTopLeftRadius: 'var(--unstable_actionRadius)',
          borderTopRightRadius: 'var(--unstable_actionRadius)',
        }}
      >
        {numSelected > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} component="div">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            level="h6"
            sx={{ flex: '1 1 100%' }}
            id="tableTitle"
            component="div"
          >
            Import Contacts From Google 
          </Typography>
        )} 
  
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton  size='sm' color="danger" variant="solid">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton size='sm' variant="outlined" color="neutral">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
}