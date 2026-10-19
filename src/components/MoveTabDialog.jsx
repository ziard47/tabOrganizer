import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { harmonyPalette } from '../theme/harmonyTheme';

const CHROME_COLORS = [
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
  'grey',
];

export default function MoveTabDialog({
  open,
  tabId,
  tabTitle,
  groups,
  currentGroupId,
  onClose,
  onMoveToGroup,
  onCreateGroupWithTab,
  onUngroupTab,
}) {
  const [selectedGroup, setSelectedGroup] = useState(
    currentGroupId !== -1 ? String(currentGroupId) : 'ungrouped'
  );
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('orange');

  const handleConfirm = () => {
    if (selectedGroup === 'ungrouped') {
      onUngroupTab(tabId);
    } else if (selectedGroup === 'create_new') {
      const name = newGroupName.trim() || 'New Group';
      onCreateGroupWithTab(tabId, name, newGroupColor);
    } else {
      onMoveToGroup(tabId, parseInt(selectedGroup, 10));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
        Move Tab to Group
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, color: '#B8A49F', fontSize: '0.8rem' }}
          noWrap
        >
          {tabTitle || 'Selected tab'}
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#D0BCB5' }}>Destination Group</InputLabel>
          <Select
            value={selectedGroup}
            label="Destination Group"
            onChange={(e) => setSelectedGroup(e.target.value)}
            sx={{
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: harmonyPalette.borderLight,
              },
            }}
          >
            <MenuItem value="ungrouped">
              <em>None (Keep Ungrouped)</em>
            </MenuItem>
            {groups.map((g) => (
              <MenuItem key={g.id} value={String(g.id)}>
                {g.title || `Group #${g.id}`} ({g.color})
              </MenuItem>
            ))}
            <MenuItem value="create_new">
              <span style={{ color: harmonyPalette.goldenSand, fontWeight: 600 }}>
                + Create New Group...
              </span>
            </MenuItem>
          </Select>
        </FormControl>

        {selectedGroup === 'create_new' && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              label="Group Name"
              placeholder="e.g. Research, Work, Shopping"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              InputLabelProps={{ sx: { color: '#D0BCB5' } }}
              InputProps={{
                sx: {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#D0BCB5' }}>Group Color</InputLabel>
              <Select
                value={newGroupColor}
                label="Group Color"
                onChange={(e) => setNewGroupColor(e.target.value)}
                sx={{
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {CHROME_COLORS.map((c) => (
                  <MenuItem key={c} value={c}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor:
                            c === 'grey'
                              ? '#94a3b8'
                              : c === 'blue'
                              ? '#3b82f6'
                              : c === 'red'
                              ? '#ef4444'
                              : c === 'yellow'
                              ? '#eab308'
                              : c === 'green'
                              ? '#10b981'
                              : c === 'pink'
                              ? '#ec4899'
                              : c === 'purple'
                              ? '#8b5cf6'
                              : c === 'cyan'
                              ? '#06b6d4'
                              : '#f97316',
                        }}
                      />
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#B8A49F' }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirm Move
        </Button>
      </DialogActions>
    </Dialog>
  );
}
