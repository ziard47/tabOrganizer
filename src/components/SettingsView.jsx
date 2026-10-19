import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function SettingsView({
  settings,
  onUpdateSettings,
}) {
  const handleToggle = (key) => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
      {/* Automation Preferences */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1.2 }}>
        Automation & Behavior
      </Typography>

      <Paper
        sx={{
          borderRadius: '12px',
          backgroundColor: 'rgba(28, 20, 20, 0.65)',
          border: `1px solid ${harmonyPalette.borderLight}`,
          mb: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Toggle 1: Auto-group by rules */}
        <Box sx={{ p: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Auto-Group on Load
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E8B86', display: 'block', fontSize: '0.72rem' }}>
              Automatically runs your custom rules whenever a tab finishes loading.
            </Typography>
          </Box>
          <Switch
            checked={Boolean(settings.autoGrouping)}
            onChange={() => handleToggle('autoGrouping')}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(235, 137, 91, 0.08)' }} />

        {/* Toggle 2: Auto-group by domains */}
        <Box sx={{ p: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Auto-Group Domains on Load
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E8B86', display: 'block', fontSize: '0.72rem' }}>
              Groups tabs by their base domain name automatically when rules do not match.
            </Typography>
          </Box>
          <Switch
            checked={Boolean(settings.autoGroupDomains)}
            onChange={() => handleToggle('autoGroupDomains')}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(235, 137, 91, 0.08)' }} />

        {/* Toggle 3: Auto-discard RAM saver */}
        <Box sx={{ p: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ pr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Memory Saver Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: '#9E8B86', display: 'block', fontSize: '0.72rem' }}>
              Enables background tab suspension to free system RAM for active tasks.
            </Typography>
          </Box>
          <Switch
            checked={Boolean(settings.autoDiscardInactive)}
            onChange={() => handleToggle('autoDiscardInactive')}
          />
        </Box>
      </Paper>

      {/* Brand Identity & Color Theme Showcase */}
      <Paper
        sx={{
          p: 2,
          borderRadius: '12px',
          backgroundColor: 'rgba(32, 23, 23, 0.8)',
          border: `1px solid ${harmonyPalette.borderGlow}`,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${alpha(harmonyPalette.coral, 0.5)}`,
              border: `1px solid ${alpha(harmonyPalette.goldenSand, 0.4)}`,
            }}
          >
            <img
              src="icons/icon128.png"
              alt="Voltrex Harmony"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              Voltrex Harmony
            </Typography>
            <Typography variant="caption" sx={{ color: harmonyPalette.goldenSand, fontWeight: 600 }}>
              Developed by Mohomed Ziard | Voltrex Digital
            </Typography>
          </Box>
        </Stack>

        <Typography variant="caption" sx={{ color: '#B8A49F', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
          Rewritten completely on React &amp; Material UI with a harmonious sunset color palette.
          Designed to bring order, speed, and serenity to your daily browser navigation.
        </Typography>

        {/* Color Palette Swatches */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label="#A14646"
            sx={{
              backgroundColor: '#A14646',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          />
          <Chip
            size="small"
            label="#DA6556"
            sx={{
              backgroundColor: '#DA6556',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          />
          <Chip
            size="small"
            label="#EB895B"
            sx={{
              backgroundColor: '#EB895B',
              color: '#180F0E',
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          />
          <Chip
            size="small"
            label="#FDB773"
            sx={{
              backgroundColor: '#FDB773',
              color: '#180F0E',
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          />
        </Box>
      </Paper>

      {/* Chrome Tab Groups Info */}
      <Paper
        sx={{
          p: 1.8,
          borderRadius: '12px',
          backgroundColor: 'rgba(28, 20, 20, 0.65)',
          border: `1px solid ${harmonyPalette.borderLight}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
          <InfoOutlinedIcon sx={{ color: '#D0BCB5', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
            Native Chrome Sync
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#9E8B86', display: 'block', lineHeight: 1.4 }}>
          Voltrex Harmony coordinates directly with Chrome's native Tab Groups API.
          Groups created, renamed, or recolored here immediately synchronize with your active browser window and tab strip.
        </Typography>
      </Paper>
    </Box>
  );
}
