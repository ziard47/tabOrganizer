/**
 * TabHarmony - Popup UI Controller
 */

// Application State
let currentWindowId = null;
let openTabs = [];
let tabGroups = [];
let customRules = [];
let settings = {
  autoGrouping: false,
  useSidePanel: false
};
let activeTabFilter = '';
let currentMoveTabId = null;

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabCountBadge = document.getElementById('tab-count-badge');
const tabSearch = document.getElementById('tab-search');

// Actions
const btnGroupDomain = document.getElementById('btn-group-domain');
const btnGroupRules = document.getElementById('btn-group-rules');
const btnCollapseToggle = document.getElementById('btn-collapse-toggle');
const btnUngroupAll = document.getElementById('btn-ungroup-all');

// Lists
const groupsContainer = document.getElementById('groups-container');
const ungroupedList = document.getElementById('ungrouped-list');
const ungroupedCount = document.getElementById('ungrouped-count');

// Rules form & lists
const ruleForm = document.getElementById('rule-form');
const editRuleId = document.getElementById('edit-rule-id');
const ruleNameInput = document.getElementById('rule-name');
const ruleColorSelect = document.getElementById('rule-color');
const rulePatternsInput = document.getElementById('rule-patterns');
const ruleKeywordsInput = document.getElementById('rule-keywords');
const btnSaveRule = document.getElementById('btn-save-rule');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const rulesListContainer = document.getElementById('rules-list-container');
const formTitle = document.getElementById('form-title');

// Settings Toggles
const toggleAutoGroup = document.getElementById('toggle-auto-group');
const toggleAutoGroupDomains = document.getElementById('toggle-auto-group-domains');

// Move Dialog Modal
const moveTabModal = document.getElementById('move-tab-modal');
const moveGroupSelect = document.getElementById('move-group-select');
const btnConfirmMove = document.getElementById('btn-confirm-move');
const btnCloseModal = document.getElementById('btn-close-modal');

// Document Ready
document.addEventListener('DOMContentLoaded', async () => {
  // Set layout class for standard popup mode
  document.body.classList.add('context-popup');

  // Get active window id
  const currentWindow = await chrome.windows.getCurrent();
  currentWindowId = currentWindow.id;

  // Load Settings and Rules from storage
  await loadStateFromStorage();
  
  // Initial draw
  await refreshTabWorkspace();

  // Bind Listeners
  initNavigation();
  initDashboardActions();
  initSearch();
  initRulesForm();
  initSettings();
  initModal();
  initChromeEventListeners();
});

/**
 * Loads rules and configuration settings from storage.
 */
async function loadStateFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get({
      rules: [],
      autoGrouping: false,
      autoGroupDomains: false
    }, (items) => {
      customRules = items.rules;
      settings.autoGrouping = items.autoGrouping;
      settings.autoGroupDomains = items.autoGroupDomains;
      
      // Update UI Toggles
      toggleAutoGroup.checked = settings.autoGrouping;
      toggleAutoGroupDomains.checked = settings.autoGroupDomains;
      
      resolve();
    });
  });
}

/**
 * Initializes sidebar navigation between views.
 */
function initNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Toggle nav buttons
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle panels
      tabPanels.forEach(panel => {
        if (panel.id === targetTab) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
      
      // If navigating to rules page, redraw rules list
      if (targetTab === 'rules-view') {
        renderRulesList();
      }
    });
  });
}

/**
 * Fetches all tabs and groups in current window and redraws dashboard workspace.
 */
async function refreshTabWorkspace() {
  // 1. Fetch tabs in current window
  openTabs = await chrome.tabs.query({ windowId: currentWindowId });
  
  // 2. Fetch groups in current window
  tabGroups = await chrome.tabGroups.query({ windowId: currentWindowId });
  
  // Update footer tab count
  tabCountBadge.textContent = `${openTabs.length} Tabs Open`;
  
  // 3. Render
  renderDashboard();
}

/**
 * Listens for real-time Chrome tab events to keep the workspace in sync.
 */
function initChromeEventListeners() {
  // Tab updates (URL, title, state changes)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.windowId === currentWindowId && (changeInfo.status === 'complete' || changeInfo.title || changeInfo.favIconUrl)) {
      refreshTabWorkspace();
    }
  });

  // Tab removals
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (removeInfo.windowId === currentWindowId) {
      refreshTabWorkspace();
    }
  });

  // Tab creations
  chrome.tabs.onCreated.addListener((tab) => {
    if (tab.windowId === currentWindowId) {
      refreshTabWorkspace();
    }
  });

  // Group events
  chrome.tabGroups.onUpdated.addListener((group) => {
    if (group.windowId === currentWindowId) {
      refreshTabWorkspace();
    }
  });
  
  chrome.tabGroups.onMoved.addListener((group) => {
    if (group.windowId === currentWindowId) {
      refreshTabWorkspace();
    }
  });
}

/**
 * Render the main dashboard list of grouped and ungrouped tabs.
 */
function renderDashboard() {
  // Update Collapse/Expand All toggle state
  if (btnCollapseToggle) {
    btnCollapseToggle.disabled = tabGroups.length === 0;
    const hasExpanded = tabGroups.some(g => !g.collapsed);
    const label = btnCollapseToggle.querySelector('span');
    if (label) {
      label.textContent = hasExpanded ? 'Collapse All' : 'Expand All';
    }
  }

  // Clear containers
  groupsContainer.innerHTML = '';
  ungroupedList.innerHTML = '';
  
  // Map groups by ID for easy access
  const groupsMap = {};
  tabGroups.forEach(group => {
    groupsMap[group.id] = {
      meta: group,
      tabs: []
    };
  });
  
  // Categorize tabs
  const ungroupedTabs = [];
  openTabs.forEach(tab => {
    if (tab.groupId !== -1 && groupsMap[tab.groupId]) {
      groupsMap[tab.groupId].tabs.push(tab);
    } else {
      ungroupedTabs.push(tab);
    }
  });
  
  // 1. Render Grouped Cards
  let renderedGroups = 0;
  tabGroups.forEach(group => {
    const groupData = groupsMap[group.id];
    
    // Filter tabs based on search query
    const visibleTabs = filterTabs(groupData.tabs, activeTabFilter);
    
    // If search filter is active and group has no matching tabs, skip rendering it
    if (activeTabFilter && visibleTabs.length === 0) {
      return;
    }
    
    renderedGroups++;
    const card = createGroupCard(group, visibleTabs);
    groupsContainer.appendChild(card);
  });
  
  // If no groups to display
  if (renderedGroups === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'help-text';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '20px';
    emptyMsg.textContent = activeTabFilter ? "No matching grouped tabs found." : "No active tab groups. Use the quick actions above to organize!";
    groupsContainer.appendChild(emptyMsg);
  }

  // 2. Render Ungrouped Tabs
  const visibleUngrouped = filterTabs(ungroupedTabs, activeTabFilter);
  ungroupedCount.textContent = visibleUngrouped.length;
  
  if (visibleUngrouped.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'tab-item help-text';
    emptyItem.style.justifyContent = 'center';
    emptyItem.textContent = activeTabFilter ? "No matching ungrouped tabs." : "All tabs are organized in groups!";
    ungroupedList.appendChild(emptyItem);
  } else {
    visibleUngrouped.forEach(tab => {
      const tabEl = createTabElement(tab);
      ungroupedList.appendChild(tabEl);
    });
  }
}

/**
 * Filter a list of tabs by search query (URL or Title)
 */
function filterTabs(tabsList, query) {
  if (!query) return tabsList;
  const lowerQuery = query.toLowerCase();
  return tabsList.filter(tab => {
    const title = (tab.title || '').toLowerCase();
    const url = (tab.url || '').toLowerCase();
    return title.includes(lowerQuery) || url.includes(lowerQuery);
  });
}

/**
 * Creates the HTML Element for a single Tab Group.
 */
function createGroupCard(group, tabs) {
  const card = document.createElement('div');
  card.className = `group-card`;
  card.id = `group-card-${group.id}`;
  
  // Check if collapsed state is saved locally (could do this, but keeping it simple for now)
  const isCollapsed = group.collapsed;
  if (isCollapsed) {
    card.classList.add('collapsed');
  }
  
  // Group header HTML
  const header = document.createElement('div');
  header.className = 'group-header';
  
  const headerLeft = document.createElement('div');
  headerLeft.className = 'group-header-left';
  
  const colorDot = document.createElement('div');
  colorDot.className = `color-dot dot-${group.color}`;
  
  // Group Color Selector dropdown instead of a simple static dot to make it premium
  const colorSelect = document.createElement('select');
  colorSelect.className = 'color-dot-select';
  colorSelect.style.display = 'none'; // Optional: replace static dot with interactive color picker
  
  // Group Name Input
  const titleInput = document.createElement('input');
  titleInput.className = 'group-title-input';
  titleInput.value = group.title || `Group #${group.id}`;
  titleInput.title = 'Click to rename group';
  
  // Rename handler
  titleInput.addEventListener('change', async (e) => {
    const newTitle = e.target.value.trim();
    if (newTitle) {
      await chrome.tabGroups.update(group.id, { title: newTitle });
    } else {
      titleInput.value = group.title;
    }
  });
  
  // Collapse handler
  const collapseIcon = document.createElement('div');
  collapseIcon.className = 'collapse-icon';
  collapseIcon.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;
  
  headerLeft.appendChild(colorDot);
  headerLeft.appendChild(titleInput);
  headerLeft.appendChild(document.createTextNode(' '));
  
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = `${tabs.length} tabs`;
  headerLeft.appendChild(badge);
  
  // Clicking the collapse area toggles list collapse
  headerLeft.addEventListener('click', async (e) => {
    // Prevent collapsing if clicking input
    if (e.target === titleInput) return;
    const currentlyCollapsed = card.classList.toggle('collapsed');
    await chrome.tabGroups.update(group.id, { collapsed: currentlyCollapsed });
  });
  
  // Group Actions (right-aligned)
  const headerRight = document.createElement('div');
  headerRight.className = 'group-header-right';
  
  // 1. Color Cycles Action
  const cycleColorBtn = document.createElement('button');
  cycleColorBtn.className = 'icon-btn';
  cycleColorBtn.title = 'Change Group Color';
  cycleColorBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"></path>
    </svg>
  `;
  cycleColorBtn.addEventListener('click', async () => {
    const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
    const curIdx = colors.indexOf(group.color);
    const nextColor = colors[(curIdx + 1) % colors.length];
    await chrome.tabGroups.update(group.id, { color: nextColor });
  });

  // 2. Ungroup Group
  const ungroupBtn = document.createElement('button');
  ungroupBtn.className = 'icon-btn';
  ungroupBtn.title = 'Ungroup all tabs';
  ungroupBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  `;
  ungroupBtn.addEventListener('click', async () => {
    const tabIds = tabs.map(t => t.id);
    if (tabIds.length) {
      await chrome.tabs.ungroup(tabIds);
    }
  });
  
  // 3. Close Group
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn icon-btn-danger';
  closeBtn.title = 'Close all tabs in group';
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.addEventListener('click', async () => {
    const tabIds = tabs.map(t => t.id);
    if (tabIds.length && confirm(`Close all ${tabIds.length} tabs in "${group.title || 'this group'}"?`)) {
      await chrome.tabs.remove(tabIds);
    }
  });

  headerRight.appendChild(cycleColorBtn);
  headerRight.appendChild(ungroupBtn);
  headerRight.appendChild(closeBtn);
  headerRight.appendChild(collapseIcon);
  
  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  card.appendChild(header);
  
  // Tab list area
  const tabList = document.createElement('div');
  tabList.className = 'tabs-list drag-zone';
  tabList.setAttribute('data-group-id', group.id);
  
  // Populate tabs
  if (tabs.length === 0) {
    const emptyTab = document.createElement('div');
    emptyTab.className = 'tab-item help-text';
    emptyTab.textContent = "Empty group. Drag tabs here to add them.";
    tabList.appendChild(emptyTab);
  } else {
    tabs.forEach(tab => {
      const tabEl = createTabElement(tab);
      tabList.appendChild(tabEl);
    });
  }
  
  card.appendChild(tabList);
  
  // Drag and Drop Zone event bindings
  setupDragZone(tabList);
  
  return card;
}

/**
 * Creates the HTML Element for a single tab list item.
 */
function createTabElement(tab) {
  const item = document.createElement('div');
  item.className = 'tab-item';
  if (tab.active) {
    item.classList.add('active-tab');
  }
  
  // Make draggable
  item.setAttribute('draggable', 'true');
  item.setAttribute('data-tab-id', tab.id);
  
  // Left side: Icon and title
  const left = document.createElement('div');
  left.className = 'tab-info-left';
  left.title = `${tab.title}\n${tab.url}`;
  
  // Favicon loader
  if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
    const img = document.createElement('img');
    img.className = 'favicon';
    img.src = tab.favIconUrl;
    img.onerror = () => {
      img.replaceWith(createFaviconPlaceholder());
    };
    left.appendChild(img);
  } else {
    left.appendChild(createFaviconPlaceholder());
  }
  
  const title = document.createElement('span');
  title.className = 'tab-title';
  title.textContent = tab.title || 'New Tab';
  left.appendChild(title);
  
  // Click left side to activate tab
  left.addEventListener('click', async () => {
    await chrome.tabs.update(tab.id, { active: true });
    // If it's a separate window, bring window to front
    await chrome.windows.update(tab.windowId, { drawAttention: true, focused: true });
  });
  
  // Right side: Quick actions
  const right = document.createElement('div');
  right.className = 'tab-actions';
  
  // 1. Move to group (folder icon)
  const moveBtn = document.createElement('button');
  moveBtn.className = 'icon-btn';
  moveBtn.title = 'Move to Group...';
  moveBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  moveBtn.addEventListener('click', () => {
    openMoveModal(tab.id);
  });
  
  // 2. Close tab (X icon)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn icon-btn-danger';
  closeBtn.title = 'Close Tab';
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await chrome.tabs.remove(tab.id);
  });
  
  right.appendChild(moveBtn);
  right.appendChild(closeBtn);
  
  item.appendChild(left);
  item.appendChild(right);
  
  // Drag operations
  item.addEventListener('dragstart', (e) => {
    item.classList.add('dragging');
    e.dataTransfer.setData('text/plain', tab.id);
  });
  
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
  });
  
  return item;
}

function createFaviconPlaceholder() {
  const ph = document.createElement('div');
  ph.className = 'favicon-placeholder';
  return ph;
}

/**
 * Setup drag-and-drop bindings on a zone container.
 */
function setupDragZone(zone) {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });
  
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    
    const tabId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetGroupIdStr = zone.getAttribute('data-group-id');
    
    if (isNaN(tabId)) return;
    
    if (targetGroupIdStr === 'ungrouped') {
      // Ungroup tab
      await chrome.tabs.ungroup(tabId);
    } else {
      // Group tab into specified group ID
      const targetGroupId = parseInt(targetGroupIdStr);
      await chrome.tabs.group({
        tabIds: tabId,
        groupId: targetGroupId
      });
    }
    await refreshTabWorkspace();
  });
}

// Bind dragover/drop to the main ungrouped list as well
setupDragZone(ungroupedList);

/**
 * Bind dashboard head actions.
 */
function initDashboardActions() {
  // 1. Group by Domain
  btnGroupDomain.addEventListener('click', async () => {
    // Fetch fresh list of tabs
    const tabs = await chrome.tabs.query({ windowId: currentWindowId });
    const domainGroups = groupTabsByDomain(tabs);
    
    const entries = Object.entries(domainGroups);
    if (entries.length === 0) {
      alert("No HTTP/HTTPS tabs found to group by domain.");
      return;
    }
    
    // Mappings of standard domains to chrome group colors to make it premium
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
    
    // Show spinner during analysis
    const originalText = btnGroupDomain.innerHTML;
    btnGroupDomain.disabled = true;
    btnGroupDomain.innerHTML = `
      <svg class="btn-icon animate-spin" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Analyzing...
    `;
    
    try {
      for (const [name, data] of entries) {
        // Group domains even if there is only 1 tab open
        if (data.tabs.length >= 1) {
          const tabIds = data.tabs.map(t => t.id);
          const nameLower = name.toLowerCase();
          
          let color = 'grey'; // fallback
          const firstTab = data.tabs[0];
          
          if (firstTab && firstTab.favIconUrl) {
            color = await extractDominantColor(firstTab.favIconUrl);
            
            // Fall back to key map if dominant color extraction returned default grey
            if (color === 'grey') {
              for (const [key, c] of Object.entries(colorMap)) {
                if (nameLower.includes(key)) {
                  color = c;
                  break;
                }
              }
            }
          } else {
            // Fall back to key map
            for (const [key, c] of Object.entries(colorMap)) {
              if (nameLower.includes(key)) {
                color = c;
                break;
              }
            }
          }
          
          // Check if group already exists
          const existingGroups = await chrome.tabGroups.query({ windowId: currentWindowId });
          const match = existingGroups.find(g => g.title && g.title.toLowerCase() === name.toLowerCase());
          
          if (match) {
            await chrome.tabs.group({ tabIds: tabIds, groupId: match.id });
          } else {
            const newGroupId = await chrome.tabs.group({ tabIds: tabIds });
            await chrome.tabGroups.update(newGroupId, {
              title: name,
              color: color
            });
          }
        }
      }
    } catch (err) {
      console.error("Error analyzing favicons:", err);
    } finally {
      btnGroupDomain.disabled = false;
      btnGroupDomain.innerHTML = originalText;
    }
    
    await refreshTabWorkspace();
  });

  // 2. Group by Custom Rules
  btnGroupRules.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ windowId: currentWindowId });
    const { grouped } = groupTabsByRules(tabs, customRules);
    
    let groupedAny = false;
    
    for (const rule of customRules) {
      const matchedTabs = grouped[rule.id] || [];
      if (matchedTabs.length > 0) {
        groupedAny = true;
        const tabIds = matchedTabs.map(t => t.id);
        
        // Find existing group by name
        const existingGroups = await chrome.tabGroups.query({ windowId: currentWindowId });
        const match = existingGroups.find(g => g.title === rule.name);
        
        if (match) {
          await chrome.tabs.group({ tabIds: tabIds, groupId: match.id });
        } else {
          const newGroupId = await chrome.tabs.group({ tabIds: tabIds });
          await chrome.tabGroups.update(newGroupId, {
            title: rule.name,
            color: rule.color
          });
        }
      }
    }
    
    if (!groupedAny) {
      alert("No open tabs matched any of your active custom rules.");
    } else {
      await refreshTabWorkspace();
    }
  });

  // 3. Collapse/Expand All
  btnCollapseToggle.addEventListener('click', async () => {
    const groups = await chrome.tabGroups.query({ windowId: currentWindowId });
    if (groups.length === 0) return;
    
    const hasExpanded = groups.some(g => !g.collapsed);
    const targetState = hasExpanded; // Collapse if any is expanded, otherwise expand
    
    for (const group of groups) {
      await chrome.tabGroups.update(group.id, { collapsed: targetState });
    }
    await refreshTabWorkspace();
  });

  // 4. Ungroup All
  btnUngroupAll.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ windowId: currentWindowId });
    const groupedTabIds = tabs.filter(t => t.groupId !== -1 && !t.pinned).map(t => t.id);
    
    if (groupedTabIds.length === 0) {
      return;
    }
    
    if (confirm("Ungroup all tabs in this window?")) {
      await chrome.tabs.ungroup(groupedTabIds);
      await refreshTabWorkspace();
    }
  });
}

/**
 * Search filtration binder.
 */
function initSearch() {
  tabSearch.addEventListener('input', (e) => {
    activeTabFilter = e.target.value.trim();
    renderDashboard();
  });
}

/**
 * Rules View Manager (CRUD rules)
 */
function renderRulesList() {
  rulesListContainer.innerHTML = '';
  
  if (customRules.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'help-text';
    emptyMsg.style.padding = '10px';
    emptyMsg.textContent = "No rules created yet. Create one above to get started!";
    rulesListContainer.appendChild(emptyMsg);
    return;
  }
  
  customRules.forEach(rule => {
    const item = document.createElement('div');
    item.className = 'rule-item-card';
    
    const meta = document.createElement('div');
    meta.className = 'rule-meta';
    
    const tag = document.createElement('span');
    tag.className = `rule-tag tag-${rule.color}`;
    tag.textContent = rule.color.toUpperCase();
    
    const details = document.createElement('div');
    details.className = 'rule-details';
    
    const name = document.createElement('span');
    name.className = 'rule-name-display';
    name.textContent = rule.name;
    
    const desc = document.createElement('span');
    desc.className = 'rule-patterns-display';
    
    // Compile rules string
    const patternsStr = (rule.patterns || []).join(', ');
    const keywordsStr = (rule.keywords || []).join(', ');
    let ruleDesc = '';
    if (patternsStr) ruleDesc += `URLs: ${patternsStr}`;
    if (keywordsStr) ruleDesc += (ruleDesc ? ' | ' : '') + `Keywords: ${keywordsStr}`;
    
    desc.textContent = ruleDesc || 'Matches nothing (empty rule)';
    
    details.appendChild(name);
    details.appendChild(desc);
    
    meta.appendChild(tag);
    meta.appendChild(details);
    
    // Actions (Edit/Delete)
    const actions = document.createElement('div');
    actions.className = 'tab-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.title = 'Edit Rule';
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;
    editBtn.addEventListener('click', () => {
      loadRuleIntoForm(rule);
    });
    
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn icon-btn-danger';
    delBtn.title = 'Delete Rule';
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    delBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
        customRules = customRules.filter(r => r.id !== rule.id);
        await saveRulesToStorage();
        renderRulesList();
      }
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    
    item.appendChild(meta);
    item.appendChild(actions);
    
    rulesListContainer.appendChild(item);
  });
}

function initRulesForm() {
  ruleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = editRuleId.value || 'rule_' + Date.now();
    const name = ruleNameInput.value.trim();
    const color = ruleColorSelect.value;
    
    // Parse commas
    const patterns = rulePatternsInput.value.split(',')
      .map(p => p.trim())
      .filter(p => p !== '');
      
    const keywords = ruleKeywordsInput.value.split(',')
      .map(k => k.trim())
      .filter(k => k !== '');
      
    const newRule = { id, name, color, patterns, keywords };
    
    const existingIdx = customRules.findIndex(r => r.id === id);
    if (existingIdx > -1) {
      // Update
      customRules[existingIdx] = newRule;
    } else {
      // Create
      customRules.push(newRule);
    }
    
    await saveRulesToStorage();
    resetRuleForm();
    renderRulesList();
  });
  
  btnCancelEdit.addEventListener('click', () => {
    resetRuleForm();
  });
}

function loadRuleIntoForm(rule) {
  formTitle.textContent = "Edit Rule";
  editRuleId.value = rule.id;
  ruleNameInput.value = rule.name;
  ruleColorSelect.value = rule.color;
  rulePatternsInput.value = (rule.patterns || []).join(', ');
  ruleKeywordsInput.value = (rule.keywords || []).join(', ');
  
  btnSaveRule.textContent = "Save Changes";
  btnCancelEdit.style.display = 'inline-flex';
  
  // Scroll form into view
  document.querySelector('.rules-workspace').scrollTop = 0;
}

function resetRuleForm() {
  formTitle.textContent = "Create New Rule";
  editRuleId.value = '';
  ruleNameInput.value = '';
  ruleColorSelect.value = 'blue';
  rulePatternsInput.value = '';
  ruleKeywordsInput.value = '';
  
  btnSaveRule.textContent = "Create Rule";
  btnCancelEdit.style.display = 'none';
}

async function saveRulesToStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ rules: customRules }, () => {
      resolve();
    });
  });
}

/**
 * Settings Managers
 */
function initSettings() {
  // Auto-Grouping toggle
  toggleAutoGroup.addEventListener('change', (e) => {
    settings.autoGrouping = e.target.checked;
    chrome.storage.local.set({ autoGrouping: settings.autoGrouping });
  });
  
  // Auto-Grouping Domains toggle
  toggleAutoGroupDomains.addEventListener('change', (e) => {
    settings.autoGroupDomains = e.target.checked;
    chrome.storage.local.set({ autoGroupDomains: settings.autoGroupDomains });
  });
}

/**
 * Modal dialogue for move-to-group actions (fallback for dragging)
 */
function initModal() {
  btnCloseModal.addEventListener('click', closeModal);
  
  btnConfirmMove.addEventListener('click', async () => {
    const targetGroupIdStr = moveGroupSelect.value;
    if (!currentMoveTabId) return;
    
    if (targetGroupIdStr === 'ungrouped') {
      await chrome.tabs.ungroup(currentMoveTabId);
    } else if (targetGroupIdStr === 'new') {
      // Prompt for new group name
      const name = prompt("Enter new group name:");
      if (name && name.trim()) {
        const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newGroupId = await chrome.tabs.group({ tabIds: currentMoveTabId });
        await chrome.tabGroups.update(newGroupId, {
          title: name.trim(),
          color: randomColor
        });
      }
    } else {
      const targetGroupId = parseInt(targetGroupIdStr);
      await chrome.tabs.group({
        tabIds: currentMoveTabId,
        groupId: targetGroupId
      });
    }
    
    closeModal();
    await refreshTabWorkspace();
  });
}

async function openMoveModal(tabId) {
  currentMoveTabId = tabId;
  
  // Fetch fresh groups
  const groups = await chrome.tabGroups.query({ windowId: currentWindowId });
  
  // Populate select dropdown
  moveGroupSelect.innerHTML = '';
  
  // Option 1: Ungrouped
  const optUngrouped = document.createElement('option');
  optUngrouped.value = 'ungrouped';
  optUngrouped.textContent = 'None (Ungroup)';
  moveGroupSelect.appendChild(optUngrouped);
  
  // Option 2: Active groups
  groups.forEach(group => {
    const opt = document.createElement('option');
    opt.value = group.id;
    opt.textContent = group.title || `Group #${group.id} (${group.color})`;
    
    // If the tab is currently in this group, select it
    const tab = openTabs.find(t => t.id === tabId);
    if (tab && tab.groupId === group.id) {
      opt.selected = true;
    }
    
    moveGroupSelect.appendChild(opt);
  });
  
  // Option 3: Create new group
  const optNew = document.createElement('option');
  optNew.value = 'new';
  optNew.textContent = '+ Create New Group...';
  moveGroupSelect.appendChild(optNew);
  
  // Display modal
  moveTabModal.classList.add('active');
}

function closeModal() {
  moveTabModal.classList.remove('active');
  currentMoveTabId = null;
}

/**
 * Maps an RGB color to the closest native Chrome tab group color.
 */
function getClosestChromeColor(r, g, b) {
  const chromeColors = {
    grey: [100, 116, 139],
    blue: [59, 130, 246],
    red: [239, 68, 68],
    yellow: [234, 179, 8],
    green: [16, 185, 129],
    pink: [236, 72, 153],
    purple: [139, 92, 246],
    cyan: [6, 182, 212],
    orange: [249, 115, 22]
  };

  let minDistance = Infinity;
  let closestColor = 'grey';

  for (const [colorName, rgb] of Object.entries(chromeColors)) {
    const distance = Math.sqrt(
      Math.pow(r - rgb[0], 2) +
      Math.pow(g - rgb[1], 2) +
      Math.pow(b - rgb[2], 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }

  return closestColor;
}

/**
 * Loads a favicon URL as a blob (to bypass CORS canvas-taint blocks),
 * draws it to a 16x16 canvas, and extracts its dominant average RGB color,
 * matching it to the closest native Chrome group color.
 */
function extractDominantColor(favIconUrl) {
  return new Promise(async (resolve) => {
    if (!favIconUrl || favIconUrl.startsWith('chrome://')) {
      resolve('grey');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
      
      const response = await fetch(favIconUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        resolve('grey');
        return;
      }
      
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 16, 16);
          
          const imgData = ctx.getImageData(0, 0, 16, 16).data;
          URL.revokeObjectURL(objectURL);
          
          let totalR = 0, totalG = 0, totalB = 0, count = 0;
          
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];
            
            // Ignore highly transparent pixels
            if (a < 150) continue;
            
            // Ignore near-white (backgrounds) and near-black (text/outlines) to get key color
            const brightness = (r + g + b) / 3;
            if (brightness > 230 || brightness < 25) continue;
            
            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }
          
          if (count > 0) {
            const avgR = Math.round(totalR / count);
            const avgG = Math.round(totalG / count);
            const avgB = Math.round(totalB / count);
            resolve(getClosestChromeColor(avgR, avgG, avgB));
          } else {
            resolve('grey');
          }
        } catch (e) {
          URL.revokeObjectURL(objectURL);
          resolve('grey');
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectURL);
        resolve('grey');
      };
      
      img.src = objectURL;
    } catch (err) {
      resolve('grey');
    }
  });
}
