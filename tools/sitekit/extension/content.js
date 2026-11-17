// A short description of the page: its own meta description, else its opening text. On claude.ai, a longer excerpt of
// the conversation, which is what a summary of it can be written from.
const READ_DELAY = 1500;

function read() {
  const meta = (document.querySelector('meta[name="description"]') ?? document.querySelector('meta[property="og:description"]'))?.content;
  const body = (document.querySelector('main, article') ?? document.body)?.innerText?.replace(/\s+/g, ' ').trim() ?? '';
  const summary = location.hostname === 'claude.ai' ? body.slice(0, 4000) : (meta || body.slice(0, 280));
  if (summary) chrome.runtime.sendMessage({ summary });
}

setTimeout(read, READ_DELAY);
chrome.runtime.onMessage.addListener(m => { if (m === 'read') read(); });
