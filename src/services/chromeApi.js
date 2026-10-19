/**
 * Voltrex Harmony Chrome API Service
 * Handles Chrome Tab, TabGroups, Storage, and Window interactions with mock fallbacks.
 */

const isExtensionEnv = typeof chrome !== 'undefined' && Boolean(chrome.tabs && chrome.tabGroups);

// Initial mock data for browser preview & testing
let mockTabs = [
  {
    id: 101,
    title: 'Voltrex Harmony · GitHub Repository',
    url: 'https://github.com/ziard47/voltrex-harmony',
    favIconUrl: 'https://github.githubassets.com/favicons/favicon.png',
    groupId: 1,
    active: true,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 102,
    title: 'Material UI: React component library',
    url: 'https://mui.com/material-ui/getting-started/',
    favIconUrl: 'https://mui.com/static/favicon.ico',
    groupId: 1,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 103,
    title: 'Vite | Next Generation Frontend Tooling',
    url: 'https://vitejs.dev/guide/',
    favIconUrl: 'https://vitejs.dev/logo.svg',
    groupId: 1,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 201,
    title: 'Lofi Chill Hip Hop Radio - Beats to relax/study to',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    favIconUrl: 'https://www.youtube.com/s/desktop/favicon.ico',
    groupId: 2,
    active: false,
    audible: true,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 202,
    title: 'Discover Weekly - Spotify Web Player',
    url: 'https://open.spotify.com/playlist/37i9dQZEVXcM1c',
    favIconUrl: 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
    groupId: 2,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: true,
  },
  {
    id: 301,
    title: 'Q4 Product Roadmap & Vision - Google Docs',
    url: 'https://docs.google.com/document/d/voltrex-harmony-roadmap',
    favIconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    groupId: -1,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 302,
    title: 'Voltrex Design System & Tokens - Figma',
    url: 'https://www.figma.com/file/voltrex-tokens',
    favIconUrl: 'https://static.figma.com/app/icon/1/favicon.png',
    groupId: -1,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
  {
    id: 303,
    title: 'Q4 Product Roadmap & Vision - Google Docs (Duplicate)',
    url: 'https://docs.google.com/document/d/voltrex-harmony-roadmap',
    favIconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    groupId: -1,
    active: false,
    audible: false,
    mutedInfo: { muted: false },
    discarded: false,
  },
];

let mockGroups = [
  { id: 1, title: 'Development', color: 'orange', collapsed: false },
  { id: 2, title: 'Media & Audio', color: 'pink', collapsed: false },
];

let mockStorage = {
  rules: [
    {
      id: 'rule_dev',
      name: 'Development',
      color: 'orange',
      patterns: ['*github.com*', '*localhost*', '*stackoverflow.com*', '*mui.com*', '*vitejs.dev*'],
      keywords: ['developer', 'documentation', 'api', 'react', 'git'],
    },
    {
      id: 'rule_media',
      name: 'Media & Audio',
      color: 'pink',
      patterns: ['*youtube.com*', '*spotify.com*', '*netflix.com*', '*twitch.tv*'],
      keywords: ['music', 'video', 'radio', 'lofi', 'stream'],
    },
    {
      id: 'rule_work',
      name: 'Work & Collab',
      color: 'green',
      patterns: ['*docs.google.com*', '*figma.com*', '*notion.so*', '*trello.com*', '*slack.com*'],
      keywords: ['roadmap', 'meeting', 'workspace', 'design'],
    },
  ],
  sessions: [
    {
      id: 'session_demo_1',
      name: 'Development & Research Focus',
      createdAt: Date.now() - 3600000 * 24,
      tabCount: 6,
      groups: [
        {
          title: 'Development',
          color: 'orange',
          tabs: [
            { title: 'Voltrex Harmony · GitHub', url: 'https://github.com/ziard47/voltrex-harmony' },
            { title: 'Material UI Library', url: 'https://mui.com/' },
          ],
        },
      ],
      ungroupedTabs: [
        { title: 'Voltrex Design Tokens', url: 'https://www.figma.com/' },
      ],
    },
  ],
  autoGrouping: false,
  autoGroupDomains: false,
  autoDiscardInactive: true,
};

let eventListeners = [];

function notifyListeners() {
  eventListeners.forEach((fn) => fn());
}

export const chromeApi = {
  isExtension: isExtensionEnv,

  async getCurrentWindowId() {
    if (isExtensionEnv) {
      try {
        const win = await chrome.windows.getCurrent();
        return win.id;
      } catch {
        return 1;
      }
    }
    return 1;
  },

  async getTabs(windowId) {
    if (isExtensionEnv) {
      return await chrome.tabs.query({ windowId });
    }
    return [...mockTabs];
  },

  async getTabGroups(windowId) {
    if (isExtensionEnv) {
      return await chrome.tabGroups.query({ windowId });
    }
    return [...mockGroups];
  },

  async groupTabs(tabIds, groupId) {
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    if (isExtensionEnv) {
      if (groupId) {
        return await chrome.tabs.group({ tabIds: ids, groupId });
      }
      return await chrome.tabs.group({ tabIds: ids });
    }

    let targetGroup;
    if (groupId) {
      targetGroup = mockGroups.find((g) => g.id === groupId);
    } else {
      targetGroup = { id: Date.now(), title: 'New Group', color: 'orange', collapsed: false };
      mockGroups.push(targetGroup);
    }

    mockTabs = mockTabs.map((t) => (ids.includes(t.id) ? { ...t, groupId: targetGroup.id } : t));
    notifyListeners();
    return targetGroup.id;
  },

  async updateTabGroup(groupId, options) {
    if (isExtensionEnv) {
      return await chrome.tabGroups.update(groupId, options);
    }
    mockGroups = mockGroups.map((g) => (g.id === groupId ? { ...g, ...options } : g));
    notifyListeners();
  },

  async ungroupTabs(tabIds) {
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    if (isExtensionEnv) {
      return await chrome.tabs.ungroup(ids);
    }
    mockTabs = mockTabs.map((t) => (ids.includes(t.id) ? { ...t, groupId: -1 } : t));
    notifyListeners();
  },

  async removeTabs(tabIds) {
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    if (isExtensionEnv) {
      return await chrome.tabs.remove(ids);
    }
    mockTabs = mockTabs.filter((t) => !ids.includes(t.id));
    notifyListeners();
  },

  async activateTab(tabId) {
    if (isExtensionEnv) {
      await chrome.tabs.update(tabId, { active: true });
      const tab = await chrome.tabs.get(tabId);
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      return;
    }
    mockTabs = mockTabs.map((t) => ({ ...t, active: t.id === tabId }));
    notifyListeners();
  },

  async toggleMuteTab(tabId, muted) {
    if (isExtensionEnv) {
      return await chrome.tabs.update(tabId, { muted: !muted });
    }
    mockTabs = mockTabs.map((t) =>
      t.id === tabId ? { ...t, mutedInfo: { muted: !muted } } : t
    );
    notifyListeners();
  },

  async discardTab(tabId) {
    if (isExtensionEnv) {
      if (chrome.tabs.discard) {
        return await chrome.tabs.discard(tabId);
      }
      return;
    }
    mockTabs = mockTabs.map((t) => (t.id === tabId ? { ...t, discarded: true } : t));
    notifyListeners();
  },

  async getStorage(defaults = {}) {
    if (isExtensionEnv) {
      return new Promise((resolve) => {
        chrome.storage.local.get(defaults, (result) => resolve(result));
      });
    }
    return { ...defaults, ...mockStorage };
  },

  async setStorage(items) {
    if (isExtensionEnv) {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, () => resolve());
      });
    }
    mockStorage = { ...mockStorage, ...items };
  },

  onChanged(callback) {
    eventListeners.push(callback);

    if (isExtensionEnv) {
      const tabListener = () => callback();
      chrome.tabs.onUpdated.addListener(tabListener);
      chrome.tabs.onRemoved.addListener(tabListener);
      chrome.tabs.onCreated.addListener(tabListener);
      chrome.tabGroups.onUpdated.addListener(tabListener);
      chrome.tabGroups.onMoved.addListener(tabListener);

      return () => {
        chrome.tabs.onUpdated.removeListener(tabListener);
        chrome.tabs.onRemoved.removeListener(tabListener);
        chrome.tabs.onCreated.removeListener(tabListener);
        chrome.tabGroups.onUpdated.removeListener(tabListener);
        chrome.tabGroups.onMoved.removeListener(tabListener);
        eventListeners = eventListeners.filter((fn) => fn !== callback);
      };
    }

    return () => {
      eventListeners = eventListeners.filter((fn) => fn !== callback);
    };
  },
};
