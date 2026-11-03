// claude.ai: Claude Code projects (claude.ai/code/project/chan_…), Claude Code sessions, and the web app's projects and
// chats. sync() reads the web app's own (undocumented) API with your session, so it may break when claude.ai changes.
const chatProject = new Map();   // conversation uuid → project uuid, from the last sync
const name = title => title?.replace(/\s*[-|–]\s*Claude(\s+Code)?\s*$/i, '').trim() || null;

export default {
  id: 'claude',
  name: 'Claude',
  hosts: ['claude.ai'],

  extract: () => {
    const href = sel => document.querySelector(sel)?.getAttribute('href') ?? null;
    return { code: href('a[href*="/code/project/chan_"]'), project: href('a[href^="/project/"]') };
  },

  async classify({ url, title, data }) {
    const path = url.pathname, id = (re, s = path) => s?.match(re)?.[1];
    const chan = id(/\/code\/project\/(chan_\w+)/);
    if (chan) return { project: { id: `claude-code:${chan}`, type: 'claude-code', name: name(title) }, activity: 'claude-code',
                       site: 'ai', meta: { thread: url.searchParams.get('thread') } };
    const session = id(/\/code\/(session_\w+)/);
    if (session) {
      const parent = id(/(chan_\w+)/, data?.code);
      return { project: parent ? { id: `claude-code:${parent}`, type: 'claude-code' } : null, activity: 'claude-code', site: 'ai', meta: { session } };
    }
    const proj = id(/^\/project\/([\w-]+)/);
    if (proj) return { project: { id: `claude:${proj}`, type: 'claude', name: name(title) }, activity: 'chat', site: 'ai' };
    const chat = id(/^\/chat\/([\w-]+)/);
    if (chat) {
      const parent = chatProject.get(chat) ?? id(/^\/project\/([\w-]+)/, data?.project);
      return { project: parent ? { id: `claude:${parent}`, type: 'claude' } : null, activity: 'chat', site: 'ai', meta: { conversation: chat } };
    }
    return { activity: 'chat', site: 'ai' };
  },

  async sync({ json }) {
    const out = [];
    for (const org of await json('https://claude.ai/api/organizations')) {
      if (!org.capabilities?.includes('chat')) continue;
      const base = `https://claude.ai/api/organizations/${org.uuid}`;
      const [projects, chats] = await Promise.all([json(`${base}/projects`), json(`${base}/chat_conversations`).catch(() => [])]);
      const counts = {};
      for (const c of chats) if (c.project_uuid) (chatProject.set(c.uuid, c.project_uuid), counts[c.project_uuid] = (counts[c.project_uuid] ?? 0) + 1);
      out.push(...projects.map(p => ({ id: `claude:${p.uuid}`, type: 'claude', name: p.name, url: `https://claude.ai/project/${p.uuid}`,
        public: false, meta: { conversations: counts[p.uuid] ?? 0, org: org.uuid } })));
    }
    return out;
  },
};
