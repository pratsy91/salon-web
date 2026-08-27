import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#6d4aff' },
    secondary: { main: '#ff5c8a' },
    background: { default: '#f6f7fb' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    h5: { fontWeight: 700, fontSize: '1.25rem', '@media (min-width:600px)': { fontSize: '1.5rem' } },
    h6: { fontWeight: 650 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%' },
        body: { overflowX: 'hidden' },
        '#root': { minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTableContainer: {
      styleOverrides: {
        root: { overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          flexWrap: 'wrap',
          gap: 8,
          '@media (max-width:599.95px)': {
            flexDirection: 'column-reverse',
            '& > :not(style) ~ :not(style)': { marginLeft: 0 },
            '& .MuiButton-root': { width: '100%' },
          },
        },
      },
    },
  },
});

export default theme;
