import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { harmonyTheme } from './theme/harmonyTheme';
import { chromeApi } from './services/chromeApi';
import { groupTabsByDomain, groupTabsByRules } from './services/rulesEngine';
import { extractDominantColor } from './services/colorExtractor';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SessionsView from './components/SessionsView';
import AnalyticsView from './components/AnalyticsView';
import RulesView from './components/RulesView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [windowId, setWindowId] = useState(1);
  const [tabs, setTabs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rules, setRules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({
    autoGrouping: false,
    autoGroupDomains: false,
    autoDiscardInactive: true,
  });
  const [isAnalyzingDomains, setIsAnalyzingDomains] = useState(false);

  // Load workspace state
  const refreshWorkspace = useCallback(async (winId = windowId) => {
    try {
      const [fetchedTabs, fetchedGroups] = await Promise.all([
        chromeApi.getTabs(winId),
        chromeApi.getTabGroups(winId),
      ]);
      setTabs(fetchedTabs || []);
      setGroups(fetchedGroups || []);
    } catch (err) {
      console.error('[Voltrex Harmony] Error refreshing workspace:', err);
    }
  }, [windowId]);

  // Load storage state (rules, settings, sessions)
  const loadStorage = useCallback(async () => {
    const data = await chromeApi.getStorage({
      rules: [],
      sessions: [],
      autoGrouping: false,
      autoGroupDomains: false,
      autoDiscardInactive: true,
    });
    setRules(data.rules || []);
    setSessions(data.sessions || []);
    setSettings({
      autoGrouping: data.autoGrouping,
      autoGroupDomains: data.autoGroupDomains,
      autoDiscardInactive: data.autoDiscardInactive,
    });
  }, []);

  // Initial load & real-time sync listeners
  useEffect(() => {
    async function init() {
      const winId = await chromeApi.getCurrentWindowId();
      setWindowId(winId);
      await loadStorage();
      await refreshWorkspace(winId);
    }
    init();

    const unsubscribe = chromeApi.onChanged(() => {
      refreshWorkspace();
    });
    return () => unsubscribe();
  }, [loadStorage, refreshWorkspace]);

  // Calculate Harmony Score (% of tabs organized)
  const harmonyScore = useMemo(() => {
    if (tabs.length === 0) return 100;
    const groupedCount = tabs.filter((t) => t.groupId !== -1).length;
    return Math.round((groupedCount / tabs.length) * 100);
  }, [tabs]);

  // --- Workspace Actions ---

  // 1. Group by Domain with Smart Favicon Color Extraction
  const handleGroupDomain = async () => {
    setIsAnalyzingDomains(true);
    try {
      const currentTabs = await chromeApi.getTabs(windowId);
      const domainGroups = groupTabsByDomain(currentTabs);
      const entries = Object.entries(domainGroups);

      for (const [name, data] of entries) {
        if (data.tabs.length >= 1) {
          const tabIds = data.tabs.map((t) => t.id);
          let color = 'grey';

          // Extract color from first tab's favicon
          const firstTab = data.tabs[0];
          if (firstTab && firstTab.favIconUrl) {
            color = await extractDominantColor(firstTab.favIconUrl);
          }

          // Check if group already exists in window
          const existing = groups.find(
            (g) => g.title && g.title.toLowerCase() === name.toLowerCase()
          );

          if (existing) {
            await chromeApi.groupTabs(tabIds, existing.id);
          } else {
            const newGroupId = await chromeApi.groupTabs(tabIds);
            await chromeApi.updateTabGroup(newGroupId, {
              title: name,
              color: color,
            });
          }
        }
      }
    } catch (err) {
      console.error('[Voltrex Harmony] Error grouping by domain:', err);
    } finally {
      setIsAnalyzingDomains(false);
      await refreshWorkspace();
    }
  };

  // 2. Apply Custom Rules
  const handleApplyRules = async () => {
    try {
      const currentTabs = await chromeApi.getTabs(windowId);
      const { grouped } = groupTabsByRules(currentTabs, rules);

      for (const rule of rules) {
        const matchedTabs = grouped[rule.id] || [];
        if (matchedTabs.length > 0) {
          const tabIds = matchedTabs.map((t) => t.id);
          const existing = groups.find((g) => g.title === rule.name);

          if (existing) {
            await chromeApi.groupTabs(tabIds, existing.id);
          } else {
            const newGroupId = await chromeApi.groupTabs(tabIds);
            await chromeApi.updateTabGroup(newGroupId, {
              title: rule.name,
              color: rule.color,
            });
          }
        }
      }
    } catch (err) {
      console.error('[Voltrex Harmony] Error applying rules:', err);
    } finally {
      await refreshWorkspace();
    }
  };

  // 3. Toggle Collapse / Expand All
  const handleCollapseToggle = async () => {
    const hasExpanded = groups.some((g) => !g.collapsed);
    const target = hasExpanded;
    for (const g of groups) {
      await chromeApi.updateTabGroup(g.id, { collapsed: target });
    }
    await refreshWorkspace();
  };

  // 4. Ungroup All
  const handleUngroupAll = async () => {
    const groupedTabIds = tabs.filter((t) => t.groupId !== -1 && !t.pinned).map((t) => t.id);
    if (groupedTabIds.length > 0) {
      await chromeApi.ungroupTabs(groupedTabIds);
      await refreshWorkspace();
    }
  };

  // 5. Update Group Metadata
  const handleUpdateGroup = async (groupId, options) => {
    await chromeApi.updateTabGroup(groupId, options);
    await refreshWorkspace();
  };

  // 6. Ungroup Group
  const handleUngroupGroup = async (tabIds) => {
    await chromeApi.ungroupTabs(tabIds);
    await refreshWorkspace();
  };

  // 7. Close Group
  const handleCloseGroup = async (tabIds) => {
    await chromeApi.removeTabs(tabIds);
    await refreshWorkspace();
  };

  // 8. Tab Actions
  const handleActivateTab = async (tabId) => {
    await chromeApi.activateTab(tabId);
  };

  const handleCloseTab = async (tabId) => {
    await chromeApi.removeTabs(tabId);
    await refreshWorkspace();
  };

  const handleMoveTabToGroup = async (tabId, targetGroupId) => {
    await chromeApi.groupTabs(tabId, targetGroupId);
    await refreshWorkspace();
  };

  const handleCreateGroupWithTab = async (tabId, groupName, groupColor) => {
    const newGroupId = await chromeApi.groupTabs(tabId);
    await chromeApi.updateTabGroup(newGroupId, {
      title: groupName,
      color: groupColor,
    });
    await refreshWorkspace();
  };

  const handleUngroupTab = async (tabId) => {
    await chromeApi.ungroupTabs(tabId);
    await refreshWorkspace();
  };

  const handleToggleMute = async (tabId, isMuted) => {
    await chromeApi.toggleMuteTab(tabId, isMuted);
    await refreshWorkspace();
  };

  const handleDiscardTab = async (tabId) => {
    await chromeApi.discardTab(tabId);
    await refreshWorkspace();
  };

  // 9. Snooze All Inactive Tabs (RAM saver)
  const handleSnoozeAllInactive = async () => {
    const inactiveTabs = tabs.filter((t) => !t.active && !t.discarded);
    for (const t of inactiveTabs) {
      await chromeApi.discardTab(t.id);
    }
    await refreshWorkspace();
  };

  // 10. Purge Duplicates
  const handlePurgeDuplicates = async () => {
    const seenUrls = new Set();
    const duplicateIds = [];

    tabs.forEach((t) => {
      const cleanUrl = (t.url || '').split('#')[0].replace(/\/$/, '');
      if (cleanUrl && !cleanUrl.startsWith('chrome://')) {
        if (seenUrls.has(cleanUrl)) {
          duplicateIds.push(t.id);
        } else {
          seenUrls.add(cleanUrl);
        }
      }
    });

    if (duplicateIds.length > 0) {
      await chromeApi.removeTabs(duplicateIds);
      await refreshWorkspace();
    }
  };

  // --- Sessions Actions ---

  const handleSaveCurrentSession = async (name) => {
    const currentTabs = await chromeApi.getTabs(windowId);
    const currentGroups = await chromeApi.getTabGroups(windowId);

    const groupMap = {};
    currentGroups.forEach((g) => {
      groupMap[g.id] = { title: g.title, color: g.color, tabs: [] };
    });

    const ungrouped = [];
    currentTabs.forEach((t) => {
      if (t.groupId !== -1 && groupMap[t.groupId]) {
        groupMap[t.groupId].tabs.push({ title: t.title, url: t.url });
      } else {
        ungrouped.push({ title: t.title, url: t.url });
      }
    });

    const newSession = {
      id: `session_${Date.now()}`,
      name,
      createdAt: Date.now(),
      tabCount: currentTabs.length,
      groups: Object.values(groupMap),
      ungroupedTabs: ungrouped,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    await chromeApi.setStorage({ sessions: updatedSessions });
  };

  const handleRestoreSession = async (session) => {
    try {
      // Recreate groups and open URLs
      if (session.groups && Array.isArray(session.groups)) {
        for (const g of session.groups) {
          if (g.tabs && g.tabs.length > 0) {
            const createdTabIds = [];
            for (const t of g.tabs) {
              if (chromeApi.isExtension && chrome.tabs.create) {
                const created = await chrome.tabs.create({ url: t.url, active: false });
                createdTabIds.push(created.id);
              }
            }
            if (createdTabIds.length > 0) {
              const newGroupId = await chromeApi.groupTabs(createdTabIds);
              await chromeApi.updateTabGroup(newGroupId, {
                title: g.title,
                color: g.color,
              });
            }
          }
        }
      }

      // Open ungrouped tabs
      if (session.ungroupedTabs && Array.isArray(session.ungroupedTabs)) {
        for (const t of session.ungroupedTabs) {
          if (chromeApi.isExtension && chrome.tabs.create) {
            await chrome.tabs.create({ url: t.url, active: false });
          }
        }
      }
    } catch (err) {
      console.error('[Voltrex Harmony] Error restoring session:', err);
    } finally {
      await refreshWorkspace();
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    await chromeApi.setStorage({ sessions: updated });
  };

  const handleImportSessions = async (imported) => {
    const merged = [...imported, ...sessions];
    setSessions(merged);
    await chromeApi.setStorage({ sessions: merged });
  };

  // --- Rules Actions ---

  const handleSaveRule = async (ruleData) => {
    const idx = rules.findIndex((r) => r.id === ruleData.id);
    let updatedRules = [];
    if (idx > -1) {
      updatedRules = [...rules];
      updatedRules[idx] = ruleData;
    } else {
      updatedRules = [...rules, ruleData];
    }
    setRules(updatedRules);
    await chromeApi.setStorage({ rules: updatedRules });
  };

  const handleDeleteRule = async (ruleId) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    await chromeApi.setStorage({ rules: updated });
  };

  const handleAddPreset = async (preset) => {
    const newRule = {
      ...preset,
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    await chromeApi.setStorage({ rules: updated });
  };

  const handleImportRules = async (imported) => {
    const merged = [...rules, ...imported];
    setRules(merged);
    await chromeApi.setStorage({ rules: merged });
  };

  // --- Settings Actions ---

  const handleUpdateSettings = async (partial) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await chromeApi.setStorage(updated);
  };

  return (
    <ThemeProvider theme={harmonyTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalTabsCount={tabs.length}
          harmonyScore={harmonyScore}
        />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'workspace' && (
            <DashboardView
              tabs={tabs}
              groups={groups}
              rules={rules}
              onGroupDomain={handleGroupDomain}
              onApplyRules={handleApplyRules}
              onCollapseToggle={handleCollapseToggle}
              onUngroupAll={handleUngroupAll}
              onUpdateGroup={handleUpdateGroup}
              onUngroupGroup={handleUngroupGroup}
              onCloseGroup={handleCloseGroup}
              onActivateTab={handleActivateTab}
              onCloseTab={handleCloseTab}
              onMoveTabToGroup={handleMoveTabToGroup}
              onCreateGroupWithTab={handleCreateGroupWithTab}
              onUngroupTab={handleUngroupTab}
              onToggleMute={handleToggleMute}
              onDiscardTab={handleDiscardTab}
              onSnoozeAllInactive={handleSnoozeAllInactive}
              onPurgeDuplicates={handlePurgeDuplicates}
              isAnalyzingDomains={isAnalyzingDomains}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsView
              sessions={sessions}
              onSaveCurrentSession={handleSaveCurrentSession}
              onRestoreSession={handleRestoreSession}
              onDeleteSession={handleDeleteSession}
              onImportSessions={handleImportSessions}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              tabs={tabs}
              groups={groups}
              onPurgeDuplicates={handlePurgeDuplicates}
              onSnoozeAllInactive={handleSnoozeAllInactive}
            />
          )}

          {activeTab === 'rules' && (
            <RulesView
              rules={rules}
              onSaveRule={handleSaveRule}
              onDeleteRule={handleDeleteRule}
              onAddPreset={handleAddPreset}
              onImportRules={handleImportRules}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
