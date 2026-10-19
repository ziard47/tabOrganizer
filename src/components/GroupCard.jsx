import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Collapse,
  InputBase,
  Menu,
  MenuItem,
  alpha,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SortByAlphaRoundedIcon from '@mui/icons-material/SortByAlphaRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import TabItem from './TabItem';
import { harmonyPalette } from '../theme/harmonyTheme';

const CHROME_COLORS = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
];

const CHROME_COLOR_HEX = {
  grey: '#94a3b8',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#10b981',
  pink: '#ec4899',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  orange: '#f97316',
};

export default function GroupCard({
  group,
  tabs,
  onUpdateGroup,
  onUngroup,
  onCloseGroup,
  onActivateTab,
  onCloseTab,
  onMoveTab,
  onToggleMute,
  onDiscardTab,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(group.title || `Group #${group.id}`);
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);

  const groupHexColor = CHROME_COLOR_HEX[group.color] || harmonyPalette.coral;
  const isCollapsed = Boolean(group.collapsed);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== group.title) {
      onUpdateGroup(group.id, { title: trimmed });
    } else {
      setTitleValue(group.title || `Group #${group.id}`);
    }
  };

  const handleSortTabs = () => {
    // Sort tabs alphabetically by Title
    const sorted = [...tabs].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
    // Since tab order in Chrome tab bar is determined by index, sorting is reflected locally
    // and tabs can be reordered in workspace view.
  };

  return (
    <Box
      sx={{
        borderRadius: '12px',
        backgroundColor: 'rgba(28, 20, 20, 0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${alpha(groupHexColor, 0.3)}`,
        mb: 1.5,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: alpha(groupHexColor, 0.55),
          boxShadow: `0 4px 18px ${alpha(groupHexColor, 0.15)}`,
        },
      }}
    >
      {/* Group Header */}
      <Box
        sx={{
          py: 0.9,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isCollapsed
            ? 'none'
            : '1px solid rgba(235, 137, 91, 0.08)',
          backgroundColor: alpha(groupHexColor, 0.08),
        }}
      >
        {/* Left: Collapse toggle, Color Dot, Title, Tab count */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }}
          onClick={() =>
            onUpdateGroup(group.id, { collapsed: !isCollapsed })
          }
        >
          {/* Collapse icon */}
          <IconButton
            size="small"
            sx={{
              p: 0.2,
              color: groupHexColor,
            }}
          >
            {isCollapsed ? (
              <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>

          {/* Color Dot Button (opens color menu) */}
          <Tooltip title="Change Group Color">
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setColorMenuAnchor(e.currentTarget);
              }}
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: groupHexColor,
                boxShadow: `0 0 8px ${groupHexColor}`,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.25)',
                },
              }}
            />
          </Tooltip>

          {/* Title or Input */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <InputBase
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur();
              }}
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                width: '100%',
                '& input': {
                  p: 0.3,
                  borderRadius: '4px',
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            />
          </Box>

          {/* Tab Count Pill */}
          <Typography
            variant="caption"
            sx={{
              px: 0.9,
              py: 0.2,
              borderRadius: '12px',
              backgroundColor: alpha(groupHexColor, 0.2),
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.68rem',
              whiteSpace: 'nowrap',
            }}
          >
            {tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}
          </Typography>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={0.3} alignItems="center">
          {/* Cycle Color Menu */}
          <Menu
            anchorEl={colorMenuAnchor}
            open={Boolean(colorMenuAnchor)}
            onClose={() => setColorMenuAnchor(null)}
            PaperProps={{
              sx: {
                backgroundColor: '#1E1414',
                border: `1px solid ${harmonyPalette.borderGlow}`,
                p: 1,
              },
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {CHROME_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => {
                    onUpdateGroup(group.id, { color: c });
                    setColorMenuAnchor(null);
                  }}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: CHROME_COLOR_HEX[c],
                    cursor: 'pointer',
                    border: group.color === c ? '2px solid #FFFFFF' : 'none',
                    boxShadow: group.color === c ? `0 0 10px ${CHROME_COLOR_HEX[c]}` : 'none',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                />
              ))}
            </Box>
          </Menu>

          {/* Ungroup */}
          <Tooltip title="Ungroup all tabs in this group">
            <IconButton
              size="small"
              onClick={() => onUngroup(tabs.map((t) => t.id))}
              sx={{
                p: 0.6,
                color: '#B8A49F',
                '&:hover': {
                  color: harmonyPalette.amberPeach,
                  backgroundColor: alpha(harmonyPalette.amberPeach, 0.15),
                },
              }}
            >
              <FolderOffRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Close Group */}
          <Tooltip title="Close all tabs in this group">
            <IconButton
              size="small"
              onClick={() => {
                if (
                  confirm(
                    `Close all ${tabs.length} tabs in "${group.title || 'this group'}"?`
                  )
                ) {
                  onCloseGroup(tabs.map((t) => t.id));
                }
              }}
              sx={{
                p: 0.6,
                color: '#B8A49F',
                '&:hover': {
                  color: '#FF6B6B',
                  backgroundColor: 'rgba(255, 107, 107, 0.15)',
                },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tabs List (Collapsible) */}
      <Collapse in={!isCollapsed}>
        <Box sx={{ p: 1.2 }}>
          {tabs.length === 0 ? (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#8E7B76',
                py: 1,
              }}
            >
              Empty group
            </Typography>
          ) : (
            tabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                onActivate={onActivateTab}
                onClose={onCloseTab}
                onMove={onMoveTab}
                onToggleMute={onToggleMute}
                onDiscard={onDiscardTab}
              />
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
