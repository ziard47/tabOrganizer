import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import GroupCard from './GroupCard';
import TabItem from './TabItem';
import MoveTabDialog from './MoveTabDialog';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function DashboardView({
  tabs,
  groups,
  rules,
  onGroupDomain,
  onApplyRules,
  onCollapseToggle,
  onUngroupAll,
  onUpdateGroup,
  onUngroupGroup,
  onCloseGroup,
  onActivateTab,
  onCloseTab,
  onMoveTabToGroup,
  onCreateGroupWithTab,
  onUngroupTab,
  onToggleMute,
  onDiscardTab,
  onSnoozeAllInactive,
  onPurgeDuplicates,
  isAnalyzingDomains,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'ungrouped', 'audio', 'sleeping'
  const [moveDialogTab, setMoveDialogTab] = useState(null);

  // Categorize grouped vs ungrouped
  const { groupsMap, ungroupedTabs, duplicateTabs } = useMemo(() => {
    const map = {};
    groups.forEach((g) => {
      map[g.id] = { meta: g, tabs: [] };
    });

    const ungrouped = [];
    const urlCountMap = {};

    tabs.forEach((tab) => {
      // Duplicate detection by URL
      const cleanUrl = (tab.url || '').split('#')[0].replace(/\/$/, '');
      if (cleanUrl && !cleanUrl.startsWith('chrome://')) {
        urlCountMap[cleanUrl] = (urlCountMap[cleanUrl] || 0) + 1;
      }

      if (tab.groupId !== -1 && map[tab.groupId]) {
        map[tab.groupId].tabs.push(tab);
      } else {
        ungrouped.push(tab);
      }
    });

    const duplicates = tabs.filter((t) => {
      const cleanUrl = (t.url || '').split('#')[0].replace(/\/$/, '');
      return urlCountMap[cleanUrl] > 1;
    });

    return { groupsMap: map, ungroupedTabs: ungrouped, duplicateTabs: duplicates };
  }, [tabs, groups]);

  // Tab filtration function
  const filterTabList = (tabList) => {
    return tabList.filter((tab) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (tab.title || '').toLowerCase();
        const url = (tab.url || '').toLowerCase();
        if (!title.includes(q) && !url.includes(q)) return false;
      }

      // Filter chips
      if (filterType === 'ungrouped') return tab.groupId === -1;
      if (filterType === 'audio') return tab.audible || tab.mutedInfo?.muted;
      if (filterType === 'sleeping') return tab.discarded;

      return true;
    });
  };

  const hasExpandedGroups = groups.some((g) => !g.collapsed);

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
      {/* Search Bar & Quick Filters */}
      <Stack spacing={1.2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search open tabs by title or web address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: harmonyPalette.coral, fontSize: 19 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearRoundedIcon sx={{ fontSize: 16, color: '#B8A49F' }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'rgba(28, 20, 20, 0.7)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: harmonyPalette.borderLight,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: harmonyPalette.borderGlow,
              },
            },
          }}
        />

        {/* Filter Chips */}
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Chip
            label="All Tabs"
            size="small"
            clickable
            onClick={() => setFilterType('all')}
            sx={{
              backgroundColor:
                filterType === 'all'
                  ? alpha(harmonyPalette.coral, 0.25)
                  : 'rgba(255, 255, 255, 0.05)',
              color: filterType === 'all' ? harmonyPalette.goldenSand : '#B8A49F',
              borderColor:
                filterType === 'all' ? harmonyPalette.coral : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          />
          <Chip
            label={`Ungrouped (${ungroupedTabs.length})`}
            size="small"
            clickable
            onClick={() => setFilterType('ungrouped')}
            sx={{
              backgroundColor:
                filterType === 'ungrouped'
                  ? alpha(harmonyPalette.coral, 0.25)
                  : 'rgba(255, 255, 255, 0.05)',
              color:
                filterType === 'ungrouped'
                  ? harmonyPalette.goldenSand
                  : '#B8A49F',
              borderColor:
                filterType === 'ungrouped' ? harmonyPalette.coral : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          />
          <Chip
            label="🔊 Audio"
            size="small"
            clickable
            onClick={() => setFilterType('audio')}
            sx={{
              backgroundColor:
                filterType === 'audio'
                  ? alpha(harmonyPalette.coral, 0.25)
                  : 'rgba(255, 255, 255, 0.05)',
              color: filterType === 'audio' ? harmonyPalette.goldenSand : '#B8A49F',
              borderColor:
                filterType === 'audio' ? harmonyPalette.coral : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          />
          <Chip
            label="💤 Sleeping"
            size="small"
            clickable
            onClick={() => setFilterType('sleeping')}
            sx={{
              backgroundColor:
                filterType === 'sleeping'
                  ? alpha(harmonyPalette.coral, 0.25)
                  : 'rgba(255, 255, 255, 0.05)',
              color:
                filterType === 'sleeping' ? harmonyPalette.goldenSand : '#B8A49F',
              borderColor:
                filterType === 'sleeping' ? harmonyPalette.coral : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          />
        </Stack>
      </Stack>

      {/* Duplicate Tabs Banner */}
      {duplicateTabs.length > 0 && (
        <Alert
          severity="warning"
          icon={<AutoFixHighRoundedIcon sx={{ color: harmonyPalette.goldenSand }} />}
          action={
            <Button
              size="small"
              variant="outlined"
              onClick={onPurgeDuplicates}
              sx={{
                py: 0.2,
                px: 1,
                fontSize: '0.72rem',
                borderColor: harmonyPalette.goldenSand,
                color: harmonyPalette.goldenSand,
              }}
            >
              Close Duplicates
            </Button>
          }
          sx={{
            mb: 2,
            py: 0.5,
            backgroundColor: alpha(harmonyPalette.deepCoral, 0.25),
            color: '#FFFFFF',
            border: `1px solid ${alpha(harmonyPalette.goldenSand, 0.3)}`,
            borderRadius: '10px',
            '& .MuiAlert-message': { fontSize: '0.78rem' },
          }}
        >
          {duplicateTabs.length} duplicate {duplicateTabs.length === 1 ? 'tab' : 'tabs'} found across your window!
        </Alert>
      )}

      {/* Quick Action Toolbar */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          size="small"
          variant="contained"
          disabled={isAnalyzingDomains}
          startIcon={
            isAnalyzingDomains ? (
              <CircularProgress size={14} sx={{ color: '#FFFFFF' }} />
            ) : (
              <PublicRoundedIcon sx={{ fontSize: 17 }} />
            )
          }
          onClick={onGroupDomain}
          sx={{ flex: '1 1 auto', py: 0.8 }}
        >
          {isAnalyzingDomains ? 'Analyzing...' : 'Group Domains'}
        </Button>

        <Button
          size="small"
          variant="outlined"
          startIcon={<BoltRoundedIcon sx={{ fontSize: 17 }} />}
          onClick={onApplyRules}
          sx={{ flex: '1 1 auto', py: 0.8 }}
        >
          Apply Rules
        </Button>

        <Tooltip title={hasExpandedGroups ? 'Collapse all active groups' : 'Expand all groups'}>
          <IconButton
            size="small"
            onClick={onCollapseToggle}
            disabled={groups.length === 0}
            sx={{
              border: `1px solid ${harmonyPalette.borderLight}`,
              borderRadius: '9px',
              p: 0.9,
              color: '#D0BCB5',
              '&:hover': {
                color: harmonyPalette.goldenSand,
                backgroundColor: alpha(harmonyPalette.coral, 0.15),
              },
            }}
          >
            {hasExpandedGroups ? (
              <UnfoldLessRoundedIcon sx={{ fontSize: 17 }} />
            ) : (
              <UnfoldMoreRoundedIcon sx={{ fontSize: 17 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Snooze all inactive tabs to immediately reclaim RAM">
          <IconButton
            size="small"
            onClick={onSnoozeAllInactive}
            sx={{
              border: `1px solid ${harmonyPalette.borderLight}`,
              borderRadius: '9px',
              p: 0.9,
              color: '#D0BCB5',
              '&:hover': {
                color: harmonyPalette.goldenSand,
                backgroundColor: alpha(harmonyPalette.amberPeach, 0.15),
              },
            }}
          >
            <BedtimeRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ungroup all tabs in this window">
          <IconButton
            size="small"
            onClick={onUngroupAll}
            disabled={groups.length === 0}
            sx={{
              border: `1px solid ${harmonyPalette.borderLight}`,
              borderRadius: '9px',
              p: 0.9,
              color: '#D0BCB5',
              '&:hover': {
                color: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.15)',
              },
            }}
          >
            <FolderOffRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Render Active Group Cards */}
      {groups.map((group) => {
        const groupData = groupsMap[group.id];
        if (!groupData) return null;
        const visibleTabs = filterTabList(groupData.tabs);

        // If filtering and no matching tabs, skip
        if (
          (searchQuery || filterType !== 'all') &&
          visibleTabs.length === 0
        ) {
          return null;
        }

        return (
          <GroupCard
            key={group.id}
            group={group}
            tabs={visibleTabs}
            onUpdateGroup={onUpdateGroup}
            onUngroup={onUngroupGroup}
            onCloseGroup={onCloseGroup}
            onActivateTab={onActivateTab}
            onCloseTab={onCloseTab}
            onMoveTab={(tabId) => {
              const tab = tabs.find((t) => t.id === tabId);
              setMoveDialogTab(tab);
            }}
            onToggleMute={onToggleMute}
            onDiscardTab={onDiscardTab}
          />
        );
      })}

      {/* Ungrouped Tabs Section */}
      {filterType !== 'all' && filterType !== 'ungrouped' ? null : (
        <Paper
          sx={{
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: 'rgba(28, 20, 20, 0.65)',
            border: `1px solid ${harmonyPalette.borderLight}`,
            mb: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                Ungrouped Tabs
              </Typography>
              <Chip
                label={filterTabList(ungroupedTabs).length}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#D0BCB5',
                }}
              />
            </Stack>

            {ungroupedTabs.length > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={onGroupDomain}
                sx={{
                  fontSize: '0.72rem',
                  color: harmonyPalette.goldenSand,
                  p: 0,
                  minWidth: 0,
                }}
              >
                Auto-Group These
              </Button>
            )}
          </Stack>

          {filterTabList(ungroupedTabs).length === 0 ? (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#8E7B76',
                py: 1,
              }}
            >
              {searchQuery
                ? 'No matching ungrouped tabs.'
                : 'All tabs are organized in harmonious groups! ✨'}
            </Typography>
          ) : (
            filterTabList(ungroupedTabs).map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                onActivate={onActivateTab}
                onClose={onCloseTab}
                onMove={(tabId) => {
                  const t = tabs.find((x) => x.id === tabId);
                  setMoveDialogTab(t);
                }}
                onToggleMute={onToggleMute}
                onDiscard={onDiscardTab}
              />
            ))
          )}
        </Paper>
      )}

      {/* Move Tab Modal Dialog */}
      {moveDialogTab && (
        <MoveTabDialog
          open={Boolean(moveDialogTab)}
          tabId={moveDialogTab.id}
          tabTitle={moveDialogTab.title}
          groups={groups}
          currentGroupId={moveDialogTab.groupId}
          onClose={() => setMoveDialogTab(null)}
          onMoveToGroup={onMoveTabToGroup}
          onCreateGroupWithTab={onCreateGroupWithTab}
          onUngroupTab={onUngroupTab}
        />
      )}
    </Box>
  );
}
