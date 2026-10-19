import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  Stack,
  alpha,
  Tooltip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function Header({
  activeTab,
  onTabChange,
  totalTabsCount,
  harmonyScore,
}) {
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${harmonyPalette.borderLight}`,
        background: `linear-gradient(180deg, rgba(32, 23, 23, 0.95) 0%, rgba(20, 14, 14, 0.9) 100%)`,
        backdropFilter: 'blur(20px)',
        px: 2,
        pt: 1.5,
        pb: 0,
        zIndex: 10,
      }}
    >
      {/* Top Brand Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Brand Icon with Glow */}
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 10px ${alpha(harmonyPalette.coral, 0.45)}`,
              border: `1px solid ${alpha(harmonyPalette.goldenSand, 0.4)}`,
            }}
          >
            <img
              src="icons/icon48.png"
              alt="Voltrex Harmony"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          <Box>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  background: `linear-gradient(90deg, #FFFFFF 0%, ${harmonyPalette.goldenSand} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Voltrex Harmony
              </Typography>
              <Chip
                label="v2.0"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  backgroundColor: alpha(harmonyPalette.coral, 0.2),
                  color: harmonyPalette.goldenSand,
                  border: `1px solid ${alpha(harmonyPalette.coral, 0.3)}`,
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: '#B8A49F',
                fontSize: '0.68rem',
                display: 'block',
                lineHeight: 1,
              }}
            >
              Intelligent Tab Organizer & Memory Studio
            </Typography>
          </Box>
        </Stack>

        {/* Right Badges */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Organization score based on grouped vs open tabs">
            <Chip
              icon={
                <AutoAwesomeRoundedIcon
                  sx={{
                    fontSize: '14px !important',
                    color: `${harmonyPalette.goldenSand} !important`,
                  }}
                />
              }
              label={`${harmonyScore}% Harmony`}
              size="small"
              sx={{
                backgroundColor: alpha(harmonyPalette.amberPeach, 0.15),
                color: harmonyPalette.goldenSand,
                border: `1px solid ${alpha(harmonyPalette.amberPeach, 0.35)}`,
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Tooltip>

          <Chip
            label={`${totalTabsCount} Tabs`}
            size="small"
            sx={{
              backgroundColor: alpha(harmonyPalette.coral, 0.18),
              color: '#FFFFFF',
              border: `1px solid ${alpha(harmonyPalette.coral, 0.3)}`,
              fontWeight: 600,
              fontSize: '0.72rem',
            }}
          />
        </Stack>
      </Stack>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => onTabChange(val)}
        variant="fullWidth"
        sx={{
          minHeight: 38,
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
          },
        }}
      >
        <Tab
          icon={<DashboardRoundedIcon sx={{ fontSize: 17 }} />}
          iconPosition="start"
          label="Workspace"
          value="workspace"
          sx={{ minHeight: 38, py: 0.6 }}
        />
        <Tab
          icon={<BookmarkAddedRoundedIcon sx={{ fontSize: 17 }} />}
          iconPosition="start"
          label="Sessions"
          value="sessions"
          sx={{ minHeight: 38, py: 0.6 }}
        />
        <Tab
          icon={<BarChartRoundedIcon sx={{ fontSize: 17 }} />}
          iconPosition="start"
          label="Analytics"
          value="analytics"
          sx={{ minHeight: 38, py: 0.6 }}
        />
        <Tab
          icon={<RuleRoundedIcon sx={{ fontSize: 17 }} />}
          iconPosition="start"
          label="Rules"
          value="rules"
          sx={{ minHeight: 38, py: 0.6 }}
        />
        <Tab
          icon={<SettingsRoundedIcon sx={{ fontSize: 17 }} />}
          iconPosition="start"
          label="Settings"
          value="settings"
          sx={{ minHeight: 38, py: 0.6 }}
        />
      </Tabs>
    </Box>
  );
}
