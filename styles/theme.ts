import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
      contrastText: '#011e2d',
    },
    secondary: {
      main: '#2b774aed',
      light: '#7fa98e',
      contrastText: '#fbf7f7',
    },
    background: {
      default: '#27455c',
      paper: '#1c3343',
    },
    text: {
      secondary: '#e3f5ff',
      primary: '#f5f5f5',
      disabled: '#757575',
    },
  },
  typography: {
    fontFamily: 'Sans Serif',
    h1: {
      fontSize: '3rem',
      letterSpacing: '-0.01562em',
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '7.8rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.167,
      color: 'secondary',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.334,
    },
    fontSize: 15,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'primary',
      }
    },
    MuiButton: {
      defaultProps: {
        color: 'secondary'
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        color: 'secondary'
      }
    }
  },
})

export default theme; 