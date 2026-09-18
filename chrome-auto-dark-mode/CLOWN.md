# Quick Color Inversion — Chrome Extension

## System Tools

- **Node.js v24** (`node`), **Python 3** (`python3`), **uv**, **ripgrep** (`rg`), **jq**, **curl** available
- Quick JS evaluation: `node -e "..."`
- Quick text search: `rg 'pattern' .`

## Project Overview

A minimal Manifest V3 Chrome extension that toggles color inversion on the active page with one click. No build step — just five files loaded as an unpacked extension.

## Source Structure

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 config: declares permissions (`storage`, `activeTab`), popup, and a content script matching `<all_urls>` |
| `popup.html` | Minimal popup UI with inline CSS and a toggle button |
| `popup.js` | Reads/writes `chrome.storage.local` for persistence; sends `enable`/`disable` messages to the active tab on toggle |
| `content.js` | Injects/removes a `<style>` tag with `filter: invert(1) hue-rotate(180deg)` on `<html>`; counter-inverts images/media so they appear normal; checks storage on page load to auto-apply saved state |
| `README.md` | Installation instructions and trade-off documentation |

## Architecture Notes

- **No background service worker** — all logic lives in the popup and content script
- **Content script trade-off**: registered on `<all_urls>` so it runs in every tab. This enables instant, persistent inversion across navigation, but a script instance exists in every tab. The README documents this for the user
- **State persistence**: `chrome.storage.local` key `enabled` (boolean). Both popup and content script read/write this
- **Messaging**: `chrome.tabs.sendMessage` from popup to content script for immediate toggle on the active tab
- **Image/media fix**: images, videos, SVGs, and canvases get a counter-inversion filter so they don't appear double-inverted
- **Installation**: load unpacked via `chrome://extensions/` with Developer mode enabled
