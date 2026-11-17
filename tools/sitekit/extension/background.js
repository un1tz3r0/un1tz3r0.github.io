// Forwards tab, navigation and focus events to the sitekit native host, which applies the [web] filters and stores them.
const HOST = 'io.github.un1tz3r0.sitekit_pulse';
const IDLE_SECONDS = 120, QUEUE_LIMIT = 1000, SNAPSHOT_DELAY = 2000, READ_DELAY = 1500;

let port = null, queue = [], snapshotTimer = null;

function connect() {
  port = chrome.runtime.connectNative(HOST);
  port.onDisconnect.addListener(() => {
    void chrome.runtime.lastError;   // read it so an uninstalled host isn't logged as an unhandled error
    port = null;
  });
}

function flush() {
  if (!port) connect();
  while (port && queue.length) {
    try {
      port.postMessage(queue[0]);
      queue.shift();
    } catch {
      port = null;
    }
  }
}

function send(kind, fields = {}) {
  queue.push({ kind, t: Date.now(), ...fields });
  if (queue.length > QUEUE_LIMIT) queue.shift();
  flush();
}

const pageOf = t => ({ tab: t.id, url: t.url, title: t.title });

// The page now in front, sent on a tab switch, a window gaining focus, or a navigation in the active tab.
async function foreground() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) send('focus', pageOf(tab));
}

function snapshotSoon() {
  clearTimeout(snapshotTimer);
  snapshotTimer = setTimeout(async () => {
    const tabs = await chrome.tabs.query({});
    send('tabs', { tabs: tabs.map(t => ({ ...pageOf(t), window: t.windowId, active: t.active })) });
  }, SNAPSHOT_DELAY);
}

function navigated(d) {
  if (d.frameId !== 0) return;
  send('nav', { tab: d.tabId, url: d.url, transition: d.transitionType });
  chrome.tabs.get(d.tabId).then(t => t.active && foreground(), () => {});
  snapshotSoon();
}

chrome.tabs.onActivated.addListener(() => { foreground(); snapshotSoon(); });
chrome.tabs.onCreated.addListener(t => { send('open', pageOf(t)); snapshotSoon(); });
chrome.tabs.onRemoved.addListener(id => { send('close', { tab: id }); snapshotSoon(); });
chrome.tabs.onUpdated.addListener((id, change, tab) => {
  if (change.title) { send('title', pageOf(tab)); snapshotSoon(); }
});
chrome.windows.onFocusChanged.addListener(id => id === chrome.windows.WINDOW_ID_NONE ? send('blur') : foreground());
chrome.webNavigation.onCommitted.addListener(navigated);
// Single-page apps change the URL without loading a page, so the content script has to look again.
chrome.webNavigation.onHistoryStateUpdated.addListener(d => {
  navigated(d);
  if (d.frameId === 0) setTimeout(() => chrome.tabs.sendMessage(d.tabId, 'read').catch(() => {}), READ_DELAY);
});
chrome.idle.setDetectionInterval(IDLE_SECONDS);
chrome.idle.onStateChanged.addListener(state => state === 'active' ? foreground() : send('blur'));
chrome.runtime.onMessage.addListener((m, sender) => {
  if (sender.tab) send('page', { tab: sender.tab.id, url: sender.tab.url, title: sender.tab.title, summary: m.summary });
});

// The alarm reconnects after the host restarts, and wakes this worker if the browser put it to sleep.
chrome.alarms.create('reconnect', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => { flush(); });
chrome.runtime.onStartup.addListener(() => { foreground(); snapshotSoon(); });
chrome.runtime.onInstalled.addListener(() => { foreground(); snapshotSoon(); });
