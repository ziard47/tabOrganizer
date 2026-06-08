/**
 * Background Service Worker for TabHarmony
 */

// Import rules engine
importScripts('rules.js');

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({
    autoGrouping: false,
    autoGroupDomains: false, // Default to false
    rules: [
      {
        id: "rule_dev",
        name: "Development",
        color: "blue",
        patterns: ["*github.com*", "*localhost*", "*stackoverflow.com*", "*codepen.io*"],
        keywords: ["developer", "documentation", "api"]
      },
      {
        id: "rule_social",
        name: "Social & Video",
        color: "pink",
        patterns: ["*youtube.com*", "*facebook.com*", "*twitter.com*", "*x.com*", "*instagram.com*", "*reddit.com*"],
        keywords: ["video", "watch", "social", "chat"]
      },
      {
        id: "rule_work",
        name: "Work & Collab",
        color: "green",
        patterns: ["*google.com/drive*", "*docs.google.com*", "*trello.com*", "*slack.com*", "*notion.so*"],
        keywords: ["dashboard", "workspace", "meeting", "zoom"]
      }
    ]
  }, (items) => {
    chrome.storage.local.set(items);
  });
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Run grouping only when the tab has loaded its URL fully
  if (changeInfo.status === 'complete' && tab && tab.url && !tab.pinned) {
    applyRulesToTab(tab);
  }
});

/**
 * Checks if a tab matches any custom rules and groups it accordingly.
 * If no custom rule matches and domain grouping is enabled, groups by domain.
 * @param {chrome.tabs.Tab} tab 
 */
function applyRulesToTab(tab) {
  chrome.storage.local.get({
    autoGrouping: false,
    autoGroupDomains: false,
    rules: []
  }, async (data) => {
    let matched = false;
    
    // 1. Try Custom Rules Auto-Grouping
    if (data.autoGrouping && data.rules.length) {
      const matchingRule = data.rules.find(rule => matchTab(tab, rule));
      
      if (matchingRule) {
        matched = true;
        try {
          // Query active groups in this window to see if the group already exists
          const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
          const existingGroup = groups.find(g => g.title === matchingRule.name);
          
          if (existingGroup) {
            await chrome.tabs.group({
              tabIds: tab.id,
              groupId: existingGroup.id
            });
          } else {
            const newGroupId = await chrome.tabs.group({
              tabIds: tab.id
            });
            await chrome.tabGroups.update(newGroupId, {
              title: matchingRule.name,
              color: matchingRule.color
            });
          }
        } catch (err) {
          console.error("Error auto-grouping by rules:", err);
        }
      }
    }
    
    // 2. Try Domain Auto-Grouping (if rules didn't match and domain auto-group is enabled)
    if (!matched && data.autoGroupDomains) {
      const domainInfo = getTabDomain(tab); // Available from imported rules.js
      if (domainInfo) {
        try {
          const { name } = domainInfo;
          const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
          
          // Find if a group with the same name already exists in this window
          const existingGroup = groups.find(g => g.title && g.title.toLowerCase() === name.toLowerCase());
          
          if (existingGroup) {
            await chrome.tabs.group({
              tabIds: tab.id,
              groupId: existingGroup.id
            });
          } else {
            // Pick a color consistently based on keyword or name hash
            const color = getDomainColor(name);
            const newGroupId = await chrome.tabs.group({
              tabIds: tab.id
            });
            await chrome.tabGroups.update(newGroupId, {
              title: name,
              color: color
            });
          }
        } catch (err) {
          console.error("Error auto-grouping by domain:", err);
        }
      }
    }
  });
}

/**
 * Generates a consistent group color for a domain using keywords or a simple hash.
 * @param {string} domain 
 * @returns {string} One of Chrome's 9 native group colors
 */
function getDomainColor(domain) {
  const colorMap = {
    'github': 'grey',
    'google': 'blue',
    'youtube': 'red',
    'stackoverflow': 'orange',
    'trello': 'cyan',
    'slack': 'purple',
    'figma': 'pink',
    'reddit': 'orange',
    'linkedin': 'blue'
  };
  
  const domainLower = domain.toLowerCase();
  for (const [key, c] of Object.entries(colorMap)) {
    if (domainLower.includes(key)) {
      return c;
    }
  }
  
  // Consistent color selection via character code hashing
  const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
