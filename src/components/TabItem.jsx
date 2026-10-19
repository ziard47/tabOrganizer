import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileMoveRoundedIcon from '@mui/icons-material/DriveFileMoveRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function TabItem({
  tab,
  onActivate,
  onClose,
  onMove,
  onToggleMute,
  onDiscard,
}) {
  const [faviconError, setFaviconError] = useState(false);

  let hostname = '';
  try {
    if (tab.url) {
      const u = new URL(tab.url);
      hostname = u.hostname.replace(/^www\./, '');
    }
  } catch {
    hostname = tab.url || '';
  }

  const isAudible = Boolean(tab.audible);
  const isMuted = Boolean(tab.mutedInfo?.muted);
  const isDiscarded = Boolean(tab.discarded);
  const isActive = Boolean(tab.active);

  return (
    <Box
      onClick={() => onActivate(tab.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.8,
        px: 1.2,
        borderRadius: '9px',
        mb: 0.6,
        cursor: 'pointer',
        backgroundColor: isActive
          ? alpha(harmonyPalette.coral, 0.16)
          : 'rgba(25, 19, 19, 0.65)',
        border: isActive
          ? `1px solid ${alpha(harmonyPalette.coral, 0.45)}`
          : '1px solid rgba(235, 137, 91, 0.08)',
        transition: 'all 0.18s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(harmonyPalette.coral, 0.12),
          borderColor: alpha(harmonyPalette.amberPeach, 0.28),
          transform: 'translateX(2px)',
        },
      }}
    >
      {/* Left: Favicon & Tab Details */}
      <Stack
        direction="row"
        spacing={1.2}
        alignItems="center"
        sx={{ minWidth: 0, flex: 1, mr: 1 }}
      >
        {/* Favicon or Fallback */}
        <Box
          sx={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          {tab.favIconUrl && !faviconError ? (
            <img
              src={tab.favIconUrl}
              alt=""
              onError={() => setFaviconError(true)}
              style={{ width: 16, height: 16, objectFit: 'contain' }}
            />
          ) : (
            <LanguageRoundedIcon sx={{ fontSize: 15, color: '#B8A49F' }} />
          )}
        </Box>

        {/* Title and Hostname */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            {isActive && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: harmonyPalette.coral,
                  boxShadow: `0 0 6px ${harmonyPalette.coral}`,
                  flexShrink: 0,
                }}
              />
            )}
            <Tooltip title={tab.title || tab.url} enterDelay={500}>
              <Typography
                noWrap
                variant="body2"
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : '#EAE0DC',
                  lineHeight: 1.25,
                }}
              >
                {tab.title || 'Untitled Tab'}
              </Typography>
            </Tooltip>
          </Stack>
          <Typography
            noWrap
            variant="caption"
            sx={{
              fontSize: '0.68rem',
              color: '#9E8B86',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            {hostname}
            {isDiscarded && ' • 💤 Sleeping'}
          </Typography>
        </Box>
      </Stack>

      {/* Right: Tab Action Controls */}
      <Stack
        direction="row"
        spacing={0.4}
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Audio / Mute Indicator */}
        {(isAudible || isMuted) && (
          <Tooltip title={isMuted ? 'Unmute Tab' : 'Mute Tab'}>
            <IconButton
              size="small"
              onClick={() => onToggleMute(tab.id, isMuted)}
              sx={{
                p: 0.5,
                color: isMuted ? '#8E7B76' : harmonyPalette.goldenSand,
                '&:hover': {
                  color: '#FFFFFF',
                  backgroundColor: alpha(harmonyPalette.coral, 0.2),
                },
              }}
            >
              {isMuted ? (
                <VolumeOffRoundedIcon sx={{ fontSize: 15 }} />
              ) : (
                <VolumeUpRoundedIcon sx={{ fontSize: 15 }} />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* RAM Saver / Discard Tab Button */}
        {!isActive && !isDiscarded && (
          <Tooltip title="Snooze Tab to Free RAM">
            <IconButton
              size="small"
              onClick={() => onDiscard(tab.id)}
              sx={{
                p: 0.5,
                color: '#9E8B86',
                '&:hover': {
                  color: harmonyPalette.goldenSand,
                  backgroundColor: alpha(harmonyPalette.amberPeach, 0.15),
                },
              }}
            >
              <BedtimeRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Move to Group */}
        <Tooltip title="Move to Group">
          <IconButton
            size="small"
            onClick={() => onMove(tab.id)}
            sx={{
              p: 0.5,
              color: '#B8A49F',
              '&:hover': {
                color: harmonyPalette.amberPeach,
                backgroundColor: alpha(harmonyPalette.amberPeach, 0.15),
              },
            }}
          >
            <DriveFileMoveRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>

        {/* Close Tab */}
        <Tooltip title="Close Tab">
          <IconButton
            size="small"
            onClick={() => onClose(tab.id)}
            sx={{
              p: 0.5,
              color: '#B8A49F',
              '&:hover': {
                color: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.15)',
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
