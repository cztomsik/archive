let styleEl = null;

function domainFromUrl(url) {
  try {
    return new URL(url).origin; // e.g. "https://example.com"
  } catch {
    return url;
  }
}

function enableInversion() {
  if (styleEl) return;
  styleEl = document.createElement('style');
  styleEl.id = 'quick-inversion-style';
  styleEl.textContent = `
    html {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    img, video, svg, [style*="background-image"], canvas, iframe {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;
  document.documentElement.appendChild(styleEl);
}

function disableInversion() {
  if (!styleEl) return;
  styleEl.remove();
  styleEl = null;
}

function applyIfNeeded(globalEnabled, pageOverrides) {
  const domain = domainFromUrl(window.location.href);
  const overrides = pageOverrides || {};
  const effective = (domain in overrides) ? overrides[domain] : !!globalEnabled;
  if (effective) {
    enableInversion();
  } else {
    disableInversion();
  }
}

// On initial load
chrome.storage.local.get(['enabled', 'pageOverrides'], (result) => {
  applyIfNeeded(result.enabled, result.pageOverrides);
});

// React to storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'local') return;
  if (changes.enabled || changes.pageOverrides) {
    chrome.storage.local.get(['enabled', 'pageOverrides'], (result) => {
      applyIfNeeded(result.enabled, result.pageOverrides);
    });
  }
});
