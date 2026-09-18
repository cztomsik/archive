const globalBtn = document.getElementById('globalBtn');
const pageOn = document.getElementById('pageOn');
const pageOff = document.getElementById('pageOff');
const pageAuto = document.getElementById('pageAuto');
const pageUrl = document.getElementById('pageUrl');
const pageStatus = document.getElementById('pageStatus');

let currentDomain = '';
let globalEnabled = false;
let pageOverrides = {};

function domainFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    currentDomain = domainFromUrl(tab.url);
    pageUrl.textContent = new URL(tab.url).hostname;
  }

  chrome.storage.local.get(['enabled', 'pageOverrides'], (result) => {
    globalEnabled = result.enabled || false;
    pageOverrides = result.pageOverrides || {};
    updateUI();
  });
}

function getPageOverride() {
  return pageOverrides[currentDomain];
}

function getPageLabel() {
  const o = getPageOverride();
  if (o === true) return 'On (overriding global)';
  if (o === false) return 'Off (overriding global)';
  return 'Auto (following global)';
}

function updateUI() {
  globalBtn.textContent = globalEnabled ? 'Disable All Pages' : 'Enable All Pages';
  globalBtn.classList.toggle('active', globalEnabled);

  const o = getPageOverride();
  pageOn.classList.toggle('active', o === true);
  pageOff.classList.toggle('active', o === false);
  pageAuto.classList.toggle('active', o === undefined);
  pageStatus.textContent = getPageLabel();

  if (!globalBtn.dataset.init) {
    globalBtn.addEventListener('click', toggleGlobal);
    pageOn.addEventListener('click', () => setPageOverride(true));
    pageOff.addEventListener('click', () => setPageOverride(false));
    pageAuto.addEventListener('click', () => setPageOverride('auto'));
    globalBtn.dataset.init = '1';
  }
}

async function toggleGlobal() {
  globalEnabled = !globalEnabled;
  await chrome.storage.local.set({ enabled: globalEnabled });
  updateUI();
}

async function setPageOverride(value) {
  if (value === 'auto') {
    delete pageOverrides[currentDomain];
  } else {
    pageOverrides[currentDomain] = value;
  }
  await chrome.storage.local.set({ pageOverrides });
  updateUI();
}

init();