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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
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

const PRESETS = [
  {
    id: 'preset_dev',
    name: 'Developer Suite',
    color: 'orange',
    patterns: ['*github.com*', '*localhost*', '*stackoverflow.com*', '*developer.mozilla.org*'],
    keywords: ['developer', 'documentation', 'api', 'react', 'git'],
  },
  {
    id: 'preset_media',
    name: 'Media & Streaming',
    color: 'pink',
    patterns: ['*youtube.com*', '*spotify.com*', '*netflix.com*', '*twitch.tv*'],
    keywords: ['video', 'watch', 'music', 'lofi', 'podcast'],
  },
  {
    id: 'preset_work',
    name: 'Work & Collaboration',
    color: 'green',
    patterns: ['*docs.google.com*', '*drive.google.com*', '*slack.com*', '*notion.so*', '*figma.com*'],
    keywords: ['dashboard', 'workspace', 'meeting', 'project', 'sprint'],
  },
  {
    id: 'preset_shop',
    name: 'Shopping & Deals',
    color: 'yellow',
    patterns: ['*amazon.*', '*ebay.*', '*aliexpress.*', '*bestbuy.com*'],
    keywords: ['cart', 'checkout', 'order', 'deal', 'price'],
  },
];

export default function RulesView({
  rules,
  onSaveRule,
  onDeleteRule,
  onAddPreset,
  onImportRules,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [patternsInput, setPatternsInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  const handleOpenAdd = () => {
    setEditingRule(null);
    setName('');
    setColor('blue');
    setPatternsInput('');
    setKeywordsInput('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setName(rule.name);
    setColor(rule.color);
    setPatternsInput((rule.patterns || []).join(', '));
    setKeywordsInput((rule.keywords || []).join(', '));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const patterns = patternsInput
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '');

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k !== '');

    const ruleData = {
      id: editingRule ? editingRule.id : `rule_${Date.now()}`,
      name: name.trim(),
      color,
      patterns,
      keywords,
    };

    onSaveRule(ruleData);
    setDialogOpen(false);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voltrex-harmony-rules-${Date.now()}.json`);
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
          onImportRules(parsed);
          alert(`Imported ${parsed.length} custom rules!`);
        }
      } catch {
        alert('Invalid JSON file format for rules.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
      {/* Top Header & Add Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
            Custom Rules Engine
          </Typography>
          <Typography variant="caption" sx={{ color: '#B8A49F', fontSize: '0.72rem' }}>
            Automate tab grouping with URL wildcards and keyword matching.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRoundedIcon sx={{ fontSize: 17 }} />}
          onClick={handleOpenAdd}
        >
          Add Rule
        </Button>
      </Stack>

      {/* Preset Rules Recommendations */}
      <Paper
        sx={{
          p: 1.5,
          borderRadius: '10px',
          backgroundColor: 'rgba(32, 23, 23, 0.75)',
          border: `1px solid ${harmonyPalette.borderLight}`,
          mb: 2.5,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: harmonyPalette.goldenSand, display: 'block', mb: 1 }}>
          ⚡ 1-Click Starter Presets
        </Typography>
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
          {PRESETS.map((preset) => {
            const exists = rules.some((r) => r.name.toLowerCase() === preset.name.toLowerCase());
            return (
              <Chip
                key={preset.id}
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important', color: `${CHROME_COLOR_HEX[preset.color]} !important` }} />}
                label={exists ? `${preset.name} (Added)` : `+ ${preset.name}`}
                size="small"
                disabled={exists}
                clickable={!exists}
                onClick={() => onAddPreset(preset)}
                sx={{
                  backgroundColor: alpha(CHROME_COLOR_HEX[preset.color], 0.15),
                  color: exists ? '#8E7B76' : '#FFFFFF',
                  borderColor: alpha(CHROME_COLOR_HEX[preset.color], 0.35),
                  borderWidth: 1,
                  borderStyle: 'solid',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* Rules List */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
          Active Rules ({rules.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="text"
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 15 }} />}
            onClick={handleExport}
            disabled={rules.length === 0}
            sx={{ color: '#D0BCB5', fontSize: '0.7rem', py: 0.1 }}
          >
            Export
          </Button>
          <Button
            size="small"
            variant="text"
            component="label"
            startIcon={<FileUploadRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ color: '#D0BCB5', fontSize: '0.7rem', py: 0.1 }}
          >
            Import
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </Button>
        </Stack>
      </Stack>

      {rules.length === 0 ? (
        <Typography variant="caption" sx={{ color: '#8E7B76', textAlign: 'center', display: 'block', py: 3 }}>
          No custom rules created yet. Click "Add Rule" or select a preset above!
        </Typography>
      ) : (
        rules.map((rule) => {
          const hex = CHROME_COLOR_HEX[rule.color] || '#3b82f6';
          return (
            <Paper
              key={rule.id}
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: 'rgba(28, 20, 20, 0.65)',
                border: `1px solid ${alpha(hex, 0.3)}`,
                mb: 1.2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1, mr: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: hex,
                        boxShadow: `0 0 6px ${hex}`,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {rule.name}
                    </Typography>
                  </Stack>

                  {/* Patterns */}
                  {rule.patterns && rule.patterns.length > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#B8A49F', fontSize: '0.7rem' }}>
                      <strong>URLs:</strong> {rule.patterns.join(', ')}
                    </Typography>
                  )}

                  {/* Keywords */}
                  {rule.keywords && rule.keywords.length > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#B8A49F', fontSize: '0.7rem' }}>
                      <strong>Keywords:</strong> {rule.keywords.join(', ')}
                    </Typography>
                  )}
                </Box>

                {/* Edit & Delete Buttons */}
                <Stack direction="row" spacing={0.4}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(rule)}
                    sx={{
                      p: 0.6,
                      color: '#B8A49F',
                      '&:hover': {
                        color: harmonyPalette.goldenSand,
                        backgroundColor: alpha(harmonyPalette.coral, 0.15),
                      },
                    }}
                  >
                    <EditRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (confirm(`Delete rule "${rule.name}"?`)) {
                        onDeleteRule(rule.id);
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
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          );
        })
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 700, pb: 1 }}>
          {editingRule ? 'Edit Rule' : 'Create Custom Rule'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              label="Group Name"
              placeholder="e.g. Work, Shopping, Tutorials"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                value={color}
                label="Group Color"
                onChange={(e) => setColor(e.target.value)}
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
                          backgroundColor: CHROME_COLOR_HEX[c],
                        }}
                      />
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              fullWidth
              label="URL Match Patterns (wildcards allowed, comma-separated)"
              placeholder="e.g. *github.com*, *stackoverflow.com*"
              value={patternsInput}
              onChange={(e) => setPatternsInput(e.target.value)}
              helperText="Matches against tab web addresses"
              InputLabelProps={{ sx: { color: '#D0BCB5' } }}
              InputProps={{
                sx: {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
              FormHelperTextProps={{ sx: { color: '#8E7B76', fontSize: '0.68rem' } }}
            />

            <TextField
              size="small"
              fullWidth
              label="Title Keywords (comma-separated)"
              placeholder="e.g. tutorial, docs, dashboard, pricing"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              helperText="Matches if keyword exists in tab title or URL"
              InputLabelProps={{ sx: { color: '#D0BCB5' } }}
              InputProps={{
                sx: {
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
              FormHelperTextProps={{ sx: { color: '#8E7B76', fontSize: '0.68rem' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#B8A49F' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
