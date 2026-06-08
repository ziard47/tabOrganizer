# 🗂️ TabHarmony

**TabHarmony** is a sleek, privacy-focused, dark-mode browser extension that organizes open browser tabs using Chrome's native Tab Groups API. It supports domain-based grouping, user-defined wildcard and keyword rules, and automatic real-time sorting.

Developed by **Mohomed Ziard | Voltrex Digital**.

<p align="center">
  <img src="icons/icon128.png" width="128" height="128" alt="TabHarmony Logo" />
</p>

---

## ✨ Key Features

*   🚀 **One-Click Smart Grouping**: Group tabs instantly by their base domain name (e.g., all `github.com` tabs grouped under "GitHub").
*   🎨 **Smart Favicon Color Matching**: Automatically fetches and analyzes the dominant color of a website's favicon (using a temporary canvas) and maps it to the closest matching native Chrome group color.
*   ⚡ **Custom Rules Engine**: Define custom rules using wildcard URLs (e.g. `*.localhost/*`) or title keywords (e.g. `tutorial`) to bundle tabs into custom-colored groups.
*   🤖 **Automation Settings**:
    *   **Auto-Group on Load**: Automatically runs your Custom Rules whenever a tab finishes loading.
    *   **Auto-Group Domains on Load**: Falls back to domain-based grouping automatically when tabs finish loading.
*   ↕️ **Collapse/Expand Toggle**: Collapse or expand all active tab groups in a single click (syncs instantly with Chrome's native tab bar).
*   🖐️ **Interactive Dashboard**:
    *   Dynamic search bar to filter tabs in real-time.
    *   Drag-and-drop support to move tabs between groups.
    *   Inline group renaming and group color cycling.
    *   Fallback select menus to move tabs between groups easily.
*   🔒 **Privacy First**: Operates 100% locally in your browser. No external API dependencies or trackers.

---

## 🛠️ File Structure

The project contains the following files:

*   **[`manifest.json`](manifest.json)**: Extension Manifest V3 configuration declaring background service workers, action popups, host permissions, and icon assets.
*   **[`rules.js`](rules.js)**: The pattern matching and URL/title extraction engine.
*   **[`background.js`](background.js)**: The background worker that listens for tab loading states and automatically routes tabs to their designated groups.
*   **[`popup.html`](popup.html)**: The dashboard layout, rule manager form, and settings panels.
*   **[`popup.css`](popup.css)**: Custom dark glassmorphic styling system, matching Chrome's native tab group colors, and spinner animations.
*   **[`popup.js`](popup.js)**: Interacts with Chrome API to fetch and render tab statuses, handles drag-and-drop events, search filters, and rule management.
*   **[`icons/icon128.png`](icons/icon128.png)**: The custom brand logo icon.

---

## ⚙️ Installation

To run this extension locally in your Chrome browser:

1.  Clone or download this repository to a folder on your computer (e.g. `j:\Lap Hard Backup\Project Files\Nodejs Projects\html\tabOrganizer`).
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  In the top-right corner, toggle the **Developer mode** switch to **ON**.
4.  In the top-left corner, click the **Load unpacked** button.
5.  Select the folder containing this project.
6.  TabHarmony is now loaded! Pin it to your extensions toolbar.

---

## 🚀 How to Use

1.  **Smart Grouping**: Click the **Group Domain** button on the dashboard to automatically organize tabs by their domain. The group colors will dynamically match the dominant colors of the site favicons.
2.  **Custom Rules**: Navigate to the **Custom Rules** tab in the sidebar. Add rules like `Work` for patterns containing `*docs.google.com*` or keywords containing `issue`. Go back to the dashboard and click **Apply Rules** to check matching tabs.
3.  **Automatic Organizing**: Go to **Settings** and toggle **Auto-Group on Load** or **Auto-Group Domains on Load**. Open a tab (e.g. `news.ycombinator.com`) and verify it groups itself automatically in the background.
4.  **Drag-and-Drop**: Click and drag a tab item inside the dashboard, then drop it inside another group card (or the ungrouped list) to move it in Chrome in real-time.
5.  **Clean up**: Use **Collapse All** to collapse all active groups in the tab strip, or click **Ungroup All** to ungroup all tabs in the active window.

---

## 📄 License

This project is licensed under the MIT License.
