import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  LinearProgress,
  Button,
  Grid,
  Chip,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function AnalyticsView({
  tabs,
  groups,
  onPurgeDuplicates,
  onSnoozeAllInactive,
}) {
  const analytics = useMemo(() => {
    const total = tabs.length;
    const grouped = tabs.filter((t) => t.groupId !== -1).length;
    const ungrouped = total - grouped;
    const sleeping = tabs.filter((t) => t.discarded).length;

    // Harmony Score: % of tabs organized into groups
    const harmonyScore = total === 0 ? 100 : Math.round((grouped / total) * 100);

    // Duplicate detection
    const urlMap = {};
    tabs.forEach((t) => {
      const u = (t.url || '').split('#')[0].replace(/\/$/, '');
      if (u && !u.startsWith('chrome://')) {
        urlMap[u] = (urlMap[u] || 0) + 1;
      }
    });

    const duplicates = tabs.filter((t) => {
      const u = (t.url || '').split('#')[0].replace(/\/$/, '');
      return urlMap[u] > 1;
    });

    // Domain breakdown
    const domainMap = {};
    tabs.forEach((t) => {
      try {
        if (t.url && (t.url.startsWith('http://') || t.url.startsWith('https://'))) {
          const host = new URL(t.url).hostname.replace(/^www\./, '');
          domainMap[host] = (domainMap[host] || 0) + 1;
        }
      } catch {
        // ignore
      }
    });

    const topDomains = Object.entries(domainMap)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estimated RAM savings (approx 60MB per sleeping tab)
    const ramReclaimedMb = sleeping * 65;

    return {
      total,
      grouped,
      ungrouped,
      sleeping,
      harmonyScore,
      duplicateCount: duplicates.length,
      topDomains,
      ramReclaimedMb,
    };
  }, [tabs, groups]);

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
      {/* Harmony Score Banner */}
      <Paper
        sx={{
          p: 2,
          borderRadius: '12px',
          background: `linear-gradient(135deg, rgba(38, 25, 25, 0.85) 0%, rgba(20, 14, 14, 0.9) 100%)`,
          border: `1px solid ${harmonyPalette.borderGlow}`,
          mb: 2.5,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <AutoAwesomeRoundedIcon sx={{ color: harmonyPalette.goldenSand, fontSize: 24 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                Harmony Score: {analytics.harmonyScore}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#B8A49F', fontSize: '0.72rem' }}>
                {analytics.harmonyScore >= 80
                  ? 'Excellent tab discipline! Your workspace is calm and organized.'
                  : 'A few ungrouped tabs are lingering. Group them to achieve peak harmony.'}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={analytics.harmonyScore}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${harmonyPalette.deepCoral}, ${harmonyPalette.coral}, ${harmonyPalette.goldenSand})`,
            },
          }}
        />
      </Paper>

      {/* Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
        {/* Total & Grouped Card */}
        <Paper
          sx={{
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(28, 20, 20, 0.65)',
            border: `1px solid ${harmonyPalette.borderLight}`,
          }}
        >
          <Typography variant="caption" sx={{ color: '#9E8B86', fontWeight: 600 }}>
            Workspace Tabs
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', my: 0.3 }}>
            {analytics.total}
          </Typography>
          <Typography variant="caption" sx={{ color: harmonyPalette.goldenSand }}>
            {analytics.grouped} grouped • {analytics.ungrouped} ungrouped
          </Typography>
        </Paper>

        {/* RAM Saver Card */}
        <Paper
          sx={{
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(28, 20, 20, 0.65)',
            border: `1px solid ${harmonyPalette.borderLight}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" sx={{ color: '#9E8B86', fontWeight: 600 }}>
              RAM Reclaimed
            </Typography>
            <BedtimeRoundedIcon sx={{ fontSize: 16, color: harmonyPalette.amberPeach }} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', my: 0.3 }}>
            ~{analytics.ramReclaimedMb} MB
          </Typography>
          <Typography variant="caption" sx={{ color: '#9E8B86' }}>
            {analytics.sleeping} sleeping tabs
          </Typography>
        </Paper>
      </Box>

      {/* Duplicates Section */}
      <Paper
        sx={{
          p: 1.8,
          borderRadius: '10px',
          backgroundColor: 'rgba(28, 20, 20, 0.65)',
          border: `1px solid ${harmonyPalette.borderLight}`,
          mb: 2.5,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <ContentCopyRoundedIcon sx={{ color: harmonyPalette.coral, fontSize: 18 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Duplicate Tab Detector
              </Typography>
              <Typography variant="caption" sx={{ color: '#9E8B86', fontSize: '0.72rem' }}>
                {analytics.duplicateCount > 0
                  ? `${analytics.duplicateCount} duplicate tabs are wasting memory`
                  : 'No duplicate URLs open'}
              </Typography>
            </Box>
          </Stack>

          {analytics.duplicateCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              onClick={onPurgeDuplicates}
              sx={{
                fontSize: '0.72rem',
                borderColor: harmonyPalette.coral,
                color: harmonyPalette.coral,
              }}
            >
              Purge All
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Top Domains Breakdown */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1.2 }}>
        Top Domains in Active Window
      </Typography>

      <Paper
        sx={{
          p: 1.5,
          borderRadius: '10px',
          backgroundColor: 'rgba(28, 20, 20, 0.65)',
          border: `1px solid ${harmonyPalette.borderLight}`,
        }}
      >
        {analytics.topDomains.length === 0 ? (
          <Typography variant="caption" sx={{ color: '#8E7B76', textAlign: 'center', display: 'block' }}>
            No HTTP/HTTPS web tabs found.
          </Typography>
        ) : (
          analytics.topDomains.map((item, idx) => {
            const pct = Math.round((item.count / analytics.total) * 100);
            return (
              <Box key={item.domain} sx={{ mb: idx === analytics.topDomains.length - 1 ? 0 : 1.2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#EAE0DC' }}>
                    {item.domain}
                  </Typography>
                  <Typography variant="caption" sx={{ color: harmonyPalette.goldenSand }}>
                    {item.count} tabs ({pct}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: harmonyPalette.amberPeach,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
}
