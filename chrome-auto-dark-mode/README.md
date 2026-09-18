# Quick Color Inversion

A minimal Chrome extension that toggles color inversion on pages with a single click. Supports both **global** (all pages) and **per-page** inversion.

## How It Works

The extension uses a CSS filter (`invert(1) hue-rotate(180deg)`) applied to the `<html>` element to invert all colors on the page. Images, videos, and other media elements get a counter-inversion so they appear normal instead of double-inverted.

State is saved in `chrome.storage.local` so toggling persists across page navigations and browser restarts.

## Usage

Click the extension icon in your toolbar to open the popup, which has two sections:

### Global Toggle
- **Enable All Pages** / **Disable All Pages** — inverts all pages that don't have a per-page override

### Per-Page Toggle (for the current tab)
- **Turn On** — always invert this page, regardless of global setting
- **Turn Off** — never invert this page, regardless of global setting
- **Auto** — follow the global setting (default)

A status line shows the current mode (On / Off / Auto).

### Example Workflow
1. Enable **Global** to invert most pages
2. Open a page that looks bad inverted (e.g., an image-heavy site)
3. Click **Turn Off** for that page only
4. Navigate back — the bad page stays normal, everything else stays inverted

## Design Trade-off

This extension registers a **content script** that runs on every page you visit (`<all_urls>` match pattern). This is a deliberate choice:

- **Pro**: The script is always ready. Enabling inversion is instant on any tab, and the setting persists automatically when you navigate to a new page.
- **Con**: A small script sits idle in every tab, listening for messages. The overhead is negligible, but it is present.

**Tip**: If you only need this occasionally, disable the extension from the Chrome extensions menu when you're not using it, and re-enable it when you need it.

## Storage Schema

| Key | Type | Description |
|-----|------|-------------|
| `enabled` | `boolean` | Global inversion toggle |
| `pageOverrides` | `object` | Per-domain overrides: `{ "https://example.com": true, "https://github.com": false }` |

When a page loads, the content script checks `pageOverrides[domain]` (e.g. `"https://github.com"`) first. If no override exists for that domain, it falls back to the `enabled` global setting.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this directory
