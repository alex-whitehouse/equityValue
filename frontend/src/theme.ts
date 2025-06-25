import { createTheme } from '@mui/material/styles';

// Extend MUI theme to include tertiary color
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
      dark: '#3a56d4',
      light: '#5d76f0',
    },
    secondary: {
      main: '#7209b7',
    },
    tertiary: {
      main: '#4cc9f0',
      contrastText: '#fff',
    },
    success: {
      main: '#2ec4b6',
    },
    warning: {
      main: '#ff9f1c',
    },
    error: {
      main: '#e71d36',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    divider: '#dee2e6',
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h1: { fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.015em' },
    h3: { fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontSize: 'var(--text-xl)', fontWeight: 700 },
    h5: { fontSize: 'var(--text-lg)', fontWeight: 600 },
    h6: { fontSize: 'var(--text-base)', fontWeight: 600 },
    body1: { fontSize: 'var(--text-base)', lineHeight: 1.7 },
    body2: { fontSize: 'var(--text-sm)', lineHeight: 1.6 },
    caption: { fontSize: 'var(--text-xs)', color: 'var(--on-surface-muted)' },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212529',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          border: '1px solid #dee2e6',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-pill)',
          textTransform: 'none',
          fontWeight: 600,
          padding: 'var(--space-sm) var(--space-lg)',
          letterSpacing: '0.01em',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'var(--shadow-sm)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'var(--shadow-sm)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 'var(--radius-pill)',
            '& fieldset': {
              borderColor: 'var(--divider)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'var(--primary-light)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--primary)',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--divider)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          transform: 'none', // removes the scaling transform
        },
      },
    },
  },
});

export default theme;