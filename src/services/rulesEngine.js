/**
 * Rules and domain parsing engine for Voltrex Harmony
 */

export function globToRegex(glob) {
  if (!glob) return null;
  const cleanGlob = glob.trim();
  if (cleanGlob === '') return null;

  let escaped = cleanGlob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  escaped = escaped.replace(/\*/g, '.*');

  let prefix = '';
  let suffix = '';
  if (!cleanGlob.startsWith('*')) prefix = '.*';
  if (!cleanGlob.endsWith('*')) suffix = '.*';

  return new RegExp('^' + prefix + escaped + suffix + '$', 'i');
}

export function matchTab(tab, rule) {
  if (!tab || !rule) return false;

  const url = tab.url || '';
  const title = tab.title || '';

  // 1. Check patterns against URL
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

export function groupTabsByRules(tabs, rules) {
  const grouped = {};
  const ungrouped = [];

  rules.forEach((rule) => {
    grouped[rule.id] = [];
  });

  for (const tab of tabs) {
    if (tab.pinned) continue;

    let matched = false;
    for (const rule of rules) {
      if (matchTab(tab, rule)) {
        grouped[rule.id].push(tab);
        matched = true;
        break;
      }
    }

    if (!matched) {
      ungrouped.push(tab);
    }
  }

  return { grouped, ungrouped };
}

export function getTabDomain(tab) {
  if (!tab) return null;
  const urlStr = tab.url || '';
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    return null;
  }

  try {
    const url = new URL(urlStr);
    let hostname = url.hostname;

    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    const parts = hostname.split('.');
    let groupName = hostname;

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

    return { name: displayName, domain: groupName, hostname: url.hostname };
  } catch {
    return null;
  }
}

export function groupTabsByDomain(tabs) {
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
        tabs: [],
      };
    }
    domainGroups[name].tabs.push(tab);
  }

  return domainGroups;
}
