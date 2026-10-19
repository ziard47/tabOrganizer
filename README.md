# 🌅 Voltrex Harmony

**Voltrex Harmony** is a state-of-the-art, dark-mode browser extension and intelligent workspace manager that brings clarity, speed, and tranquility to open browser tabs using Chrome's native Tab Groups API.

Completely rewritten with **React 19** and **Material UI (MUI)**, Voltrex Harmony features an exquisite warm sunset aesthetic tailored around four signature tones:
*   🍷 `#A14646` (Deep Coral Wine)
*   🌺 `#DA6556` (Vibrant Terracotta Coral)
*   🍑 `#EB895B` (Warm Amber Peach)
*   🍯 `#FDB773` (Golden Honey Sand)

Developed by **Mohomed Ziard | Voltrex Digital**.

---

## ✨ Features Overview

### 1. 🗂️ Intelligent Workspace & Tab Grouping
*   🌐 **One-Click Domain Grouping**: Group open tabs by base domain with automatic second-level domain clustering (e.g. `github.com`, `google.com`).
*   🎨 **Smart Favicon Color Extraction**: Analyzes the website's favicon using canvas pixel processing and dynamically matches it to the closest native Chrome group color.
*   ⚡ **Custom Rules Engine**: User-defined wildcard patterns (`*github.com*`, `*localhost*`) and keyword filters (`docs`, `meeting`, `api`) with automated priority grouping.
*   ↕️ **Collapse / Expand Toggle**: Collapse or expand all active groups in one click.
*   🏷️ **Inline Renaming & Color Cycling**: Click group names to edit live in Chrome, or switch colors directly from the palette menu.
*   🧹 **Duplicate Tab Purge**: Identifies repeated URLs across open tabs and closes duplicates with one click.
*   💤 **Tab Memory Saver (Snooze Tabs)**: Uses `chrome.tabs.discard()` to immediately release RAM from dormant tabs without closing them.
*   🔊 **Audio & Mute Controls**: Instantly detect tabs playing media and toggle mute directly from the popup.

### 2. 💾 Workspace Stash & Session Snapshots *(New Feature)*
*   **Stash Workspace**: Save all open tabs and group configurations (titles, colors, tab order) into a named session snapshot.
*   **One-Click Restore**: Reopen and restore your saved workspace on demand.
*   **Import / Export**: Backup or migrate your sessions across machines via JSON.

### 3. 📊 Harmony Analytics *(New Feature)*
*   **Harmony Score**: Dynamic metric tracking how effectively your tabs are organized.
*   **RAM Reclaimed Tracker**: Real-time counter of system memory freed through suspended inactive tabs.
*   **Domain Breakdown**: Visual breakdown bars showing your most frequently visited services.

### 4. ⚡ Curated Starter Presets *(New Feature)*
*   💻 **Developer Suite**: GitHub, StackOverflow, MDN, localhost
*   🎥 **Media & Entertainment**: YouTube, Spotify, Netflix, Twitch
*   💼 **Work & Collaboration**: Google Docs, Drive, Slack, Notion, Figma
*   🛍️ **Shopping & Deals**: Amazon, eBay, AliExpress, BestBuy

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React 19, Material UI (`@mui/material`), Emotion (`@emotion/react`, `@emotion/styled`), `@mui/icons-material`
*   **Bundler**: Vite
*   **Extension Format**: Chrome Manifest V3 (Service Worker `background.js`, native Tab Groups API)
*   **Typography**: Google Fonts (*Outfit* & *Plus Jakarta Sans*)

---

## ⚙️ Installation & Development

### 1. Build the Extension
```bash
npm install
npm run build
```

This compiles the React app and automatically populates the `dist/` directory with `manifest.json`, `background.js`, `rules.js`, and `icons/`.

### 2. Load in Google Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Turn ON **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `dist/` directory (or the root project directory).
5. Pin **Voltrex Harmony** to your browser toolbar!

---

## 💡 Suggested Future Features

1.  **AI Tab Clustering & Semantic Grouping**: Use a local or cloud LLM to automatically cluster tabs by research topic or intent (e.g., "Research on Machine Learning", "Trip to Tokyo") rather than just domain.
2.  **Context-Aware Auto-Sleep Policies**: Configurable background timer to automatically snooze tabs inactive for >15 minutes to maximize battery life on laptops.
3.  **Cross-Device Cloud Sync**: Synchronize custom rules and stashed workspaces via Firebase or Supabase across all Chrome browsers.
4.  **Omnibox Quick Commands**: Type `vh group` or `vh stash <name>` directly in the Chrome address bar to organize tabs without opening the popup.
5.  **Per-Group Memory Budgets**: Alert when a tab group exceeds a threshold of open tabs or active video streams.

---

## 📄 License

Licensed under the MIT License. Developed by **Mohomed Ziard | Voltrex Digital**.
