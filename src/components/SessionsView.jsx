import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TabRoundedIcon from '@mui/icons-material/TabRounded';
import { harmonyPalette } from '../theme/harmonyTheme';

export default function SessionsView({
  sessions,
  onSaveCurrentSession,
  onRestoreSession,
  onDeleteSession,
  onImportSessions,
}) {
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    const name = sessionName.trim() || `Session on ${new Date().toLocaleDateString()}`;
    onSaveCurrentSession(name);
    setSessionName('');
    setIsSaving(false);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voltrex-harmony-sessions-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportSessions(parsed);
          alert(`Successfully imported ${parsed.length} sessions!`);
        }
      } catch {
        alert('Invalid JSON file format for sessions.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
      {/* Top Banner / Create Stash Card */}
      <Paper
        sx={{
          p: 2,
          borderRadius: '12px',
          backgroundColor: 'rgba(32, 23, 23, 0.8)',
          border: `1px solid ${harmonyPalette.borderGlow}`,
          mb: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${harmonyPalette.coral}, ${harmonyPalette.goldenSand})`,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <BookmarkAddedRoundedIcon sx={{ color: harmonyPalette.goldenSand, fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              Stash Workspace Snapshot
            </Typography>
            <Typography variant="caption" sx={{ color: '#B8A49F', fontSize: '0.72rem' }}>
              Save all open tabs, groups, titles, and colors to restore anytime later.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Project Phoenix Research, Morning Routines..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            InputProps={{
              sx: {
                backgroundColor: 'rgba(15, 11, 11, 0.6)',
                borderRadius: '9px',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: harmonyPalette.borderLight,
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ whiteSpace: 'nowrap', px: 2.5 }}
          >
            Stash Tabs
          </Button>
        </Stack>

        {/* Export / Import tools */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Button
            size="small"
            variant="text"
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleExport}
            disabled={sessions.length === 0}
            sx={{ color: '#D0BCB5', fontSize: '0.72rem', py: 0.2 }}
          >
            Export JSON
          </Button>
          <Button
            size="small"
            variant="text"
            component="label"
            startIcon={<FileUploadRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ color: '#D0BCB5', fontSize: '0.72rem', py: 0.2 }}
          >
            Import JSON
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </Button>
        </Stack>
      </Paper>

      {/* Saved Sessions List */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
          Saved Sessions ({sessions.length})
        </Typography>
      </Stack>

      {sessions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: '#8E7B76' }}>
          <BookmarkAddedRoundedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">No stashed sessions yet.</Typography>
          <Typography variant="caption">
            Name your workspace above to create your first session snapshot!
          </Typography>
        </Box>
      ) : (
        sessions.map((sess) => (
          <Paper
            key={sess.id}
            sx={{
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: 'rgba(28, 20, 20, 0.65)',
              border: `1px solid ${harmonyPalette.borderLight}`,
              mb: 1.2,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: alpha(harmonyPalette.coral, 0.4),
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ minWidth: 0, flex: 1, mr: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }} noWrap>
                  {sess.name}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <Stack direction="row" spacing={0.4} alignItems="center">
                    <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#9E8B86' }} />
                    <Typography variant="caption" sx={{ color: '#9E8B86', fontSize: '0.68rem' }}>
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.4} alignItems="center">
                    <TabRoundedIcon sx={{ fontSize: 13, color: harmonyPalette.goldenSand }} />
                    <Typography variant="caption" sx={{ color: '#D0BCB5', fontSize: '0.68rem' }}>
                      {sess.tabCount} tabs ({(sess.groups || []).length} groups)
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RestoreRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onRestoreSession(sess)}
                  sx={{
                    fontSize: '0.72rem',
                    py: 0.4,
                    px: 1.2,
                    borderColor: alpha(harmonyPalette.coral, 0.4),
                  }}
                >
                  Restore
                </Button>
                <Tooltip title="Delete Snapshot">
                  <IconButton
                    size="small"
                    onClick={() => onDeleteSession(sess.id)}
                    sx={{
                      p: 0.6,
                      color: '#B8A49F',
                      '&:hover': {
                        color: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.15)',
                      },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}
    </Box>
  );
}
