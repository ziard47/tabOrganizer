/**
 * Rules engine for TabHarmony
 * Handles matching tab URLs and titles against custom user rules.
 */

// Helper to escape regex special characters, keeping wildcards (*) intact
function globToRegex(glob) {
  if (!glob) return null;
  // Clean up whitespace
  const cleanGlob = glob.trim();
  if (cleanGlob === '') return null;
  
  // Escape regex chars except *
  let escaped = cleanGlob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  // Convert * to .*
  escaped = escaped.replace(/\*/g, '.*');
  
  // If there's no wildcard at the beginning/end, let's make it flexible
  // so that "github.com" matches "*github.com*" implicitly
  let prefix = '';
  let suffix = '';
  if (!cleanGlob.startsWith('*')) prefix = '.*';
  if (!cleanGlob.endsWith('*')) suffix = '.*';
  
  return new RegExp('^' + prefix + escaped + suffix + '$', 'i');
}

/**
 * Checks if a tab matches a specific rule
 * @param {chrome.tabs.Tab} tab 
 * @param {Object} rule 
 * @returns {boolean}
 */
function matchTab(tab, rule) {
  if (!tab || !rule) return false;
  
  const url = tab.url || '';
  const title = tab.title || '';
  
  // 1. Check patterns (wildcards) against URL
  if (rule.patterns && Array.isArray(rule.patterns)) {
    for (const pattern of rule.patterns) {
      if (!pattern) continue;
      const regex = globToRegex(pattern);
      if (regex && regex.test(url)) {
        return true;
      }
    }
  }
  
  // 2. Check keywords against Title and URL
  if (rule.keywords && Array.isArray(rule.keywords)) {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    for (const keyword of rule.keywords) {
      if (!keyword) continue;
      const cleanKeyword = keyword.trim().toLowerCase();
      if (cleanKeyword === '') continue;
      if (urlLower.includes(cleanKeyword) || titleLower.includes(cleanKeyword)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Groups tabs by matching rules
 * @param {Array<chrome.tabs.Tab>} tabs 
 * @param {Array<Object>} rules 
 * @returns {Object} { ruleId: Array<chrome.tabs.Tab>, ungrouped: Array<chrome.tabs.Tab> }
 */
function groupTabsByRules(tabs, rules) {
  const grouped = {};
  const ungrouped = [];
  
  // Initialize grouped structure
  rules.forEach(rule => {
    grouped[rule.id] = [];
  });
  
  // Match each tab
  for (const tab of tabs) {
    // Ignore internal chrome pages if desired, but we can group them too
    // Usually we ignore settings pages or pins
    if (tab.pinned) continue;
    
    let matched = false;
    for (const rule of rules) {
      if (matchTab(tab, rule)) {
        grouped[rule.id].push(tab);
        matched = true;
        break; // Match first rule (priority based on order)
      }
    }
    
    if (!matched) {
      ungrouped.push(tab);
    }
  }
  
  return { grouped, ungrouped };
}

/**
 * Helper to extract the domain name from a tab's URL
 * @param {chrome.tabs.Tab} tab 
 * @returns {Object|null} { name: displayName, domain: groupName }
 */
function getTabDomain(tab) {
  if (!tab) return null;
  const urlStr = tab.url || '';
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    return null;
  }
  
  try {
    const url = new URL(urlStr);
    let hostname = url.hostname;
    
    // Remove 'www.'
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Extract main domain (e.g. github.com from gist.github.com or raw.github.com)
    const parts = hostname.split('.');
    let groupName = hostname; // Default to full hostname if we can't parse
    
    if (parts.length >= 2) {
      const tld2 = parts[parts.length - 2] + '.' + parts[parts.length - 1];
      const common2PartTlds = ['co.uk', 'com.au', 'org.uk', 'gov.uk', 'co.jp', 'com.br', 'com.mx'];
      
      if (parts.length >= 3 && common2PartTlds.includes(tld2)) {
        groupName = parts[parts.length - 3] + '.' + tld2;
      } else {
        groupName = parts[parts.length - 2] + '.' + parts[parts.length - 1];
      }
    }
    
    const nameParts = groupName.split('.');
    const displayName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    
    return { name: displayName, domain: groupName };
  } catch (e) {
    return null;
  }
}

/**
 * Automatically groups tabs by their second-level domain name
 * @param {Array<chrome.tabs.Tab>} tabs 
 * @returns {Object} Map of domain to Array of tabs
 */
function groupTabsByDomain(tabs) {
  const domainGroups = {};
  
  for (const tab of tabs) {
    if (tab.pinned) continue;
    
    const domainInfo = getTabDomain(tab);
    if (!domainInfo) continue;
    
    const { name, domain } = domainInfo;
    
    if (!domainGroups[name]) {
      domainGroups[name] = {
        name: name,
        domain: domain,
        tabs: []
      };
    }
    domainGroups[name].tabs.push(tab);
  }
  
  return domainGroups;
}

// Export functions if running in Node.js (for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    globToRegex,
    matchTab,
    groupTabsByRules,
    getTabDomain,
    groupTabsByDomain
  };
}
