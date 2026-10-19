import { createTheme, alpha } from '@mui/material/styles';

/**
 * Voltrex Harmony Brand Palette
 * #A14646 - Deep Coral Wine / Crimson Burgundy
 * #DA6556 - Vibrant Terracotta Coral (Primary)
 * #EB895B - Warm Amber Peach (Secondary)
 * #FDB773 - Golden Honey Sand (Accent / Highlight)
 */
export const harmonyPalette = {
  deepCoral: '#A14646',
  coral: '#DA6556',
  amberPeach: '#EB895B',
  goldenSand: '#FDB773',
  bgDark: '#0F0B0B',
  bgSurface: '#191313',
  bgCard: 'rgba(32, 23, 23, 0.72)',
  bgElevated: 'rgba(44, 31, 31, 0.85)',
  borderLight: 'rgba(235, 137, 91, 0.16)',
  borderGlow: 'rgba(218, 101, 86, 0.35)',
};

export const harmonyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: harmonyPalette.coral,
      dark: harmonyPalette.deepCoral,
      light: harmonyPalette.amberPeach,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: harmonyPalette.amberPeach,
      light: harmonyPalette.goldenSand,
      dark: harmonyPalette.coral,
      contrastText: '#180F0E',
    },
    background: {
      default: harmonyPalette.bgDark,
      paper: harmonyPalette.bgSurface,
    },
    text: {
      primary: '#FDF7F5',
      secondary: '#D0BCB5',
      disabled: '#87706A',
    },
    divider: 'rgba(235, 137, 91, 0.12)',
    success: {
      main: '#4EBA86',
      contrastText: '#0A2014',
    },
    warning: {
      main: harmonyPalette.goldenSand,
      contrastText: '#261403',
    },
    info: {
      main: '#66B3FF',
    },
    error: {
      main: harmonyPalette.deepCoral,
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: harmonyPalette.bgDark,
          color: '#FDF7F5',
          scrollbarColor: `${harmonyPalette.coral} ${harmonyPalette.bgDark}`,
          '&::-webkit-scrollbar': {
            width: 6,
            height: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(218, 101, 86, 0.4)',
            borderRadius: 6,
            '&:hover': {
              backgroundColor: harmonyPalette.amberPeach,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: harmonyPalette.bgCard,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${harmonyPalette.borderLight}`,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '6px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 14px ${alpha(harmonyPalette.coral, 0.35)}`,
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${harmonyPalette.coral} 0%, ${harmonyPalette.amberPeach} 100%)`,
          color: '#FFFFFF',
          border: `1px solid rgba(253, 183, 115, 0.25)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${harmonyPalette.deepCoral} 0%, ${harmonyPalette.coral} 100%)`,
          },
        },
        outlinedPrimary: {
          borderColor: alpha(harmonyPalette.coral, 0.4),
          color: harmonyPalette.goldenSand,
          '&:hover': {
            borderColor: harmonyPalette.goldenSand,
            backgroundColor: alpha(harmonyPalette.coral, 0.08),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 8,
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          fontSize: '0.85rem',
          textTransform: 'none',
          minHeight: 44,
          padding: '8px 14px',
          color: '#B8A49F',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: harmonyPalette.goldenSand,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: `linear-gradient(90deg, ${harmonyPalette.coral}, ${harmonyPalette.goldenSand})`,
          boxShadow: `0 0 10px ${alpha(harmonyPalette.goldenSand, 0.6)}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#261A1A',
          border: `1px solid ${harmonyPalette.borderLight}`,
          color: '#FFF2EB',
          fontSize: '0.75rem',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1515',
          border: `1px solid ${harmonyPalette.borderGlow}`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.7), 0 0 30px ${alpha(harmonyPalette.coral, 0.15)}`,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: harmonyPalette.goldenSand,
            '& + .MuiSwitch-track': {
              backgroundColor: harmonyPalette.coral,
              opacity: 0.9,
            },
          },
        },
        track: {
          backgroundColor: '#3D2D2D',
        },
      },
    },
  },
});
