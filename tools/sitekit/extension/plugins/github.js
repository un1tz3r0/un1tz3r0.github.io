const RESERVED = new Set(['settings', 'notifications', 'orgs', 'organizations', 'marketplace', 'explore', 'topics', 'login', 'logout',
  'sponsors', 'features', 'pulls', 'issues', 'search', 'new', 'codespaces', 'users', 'apps', 'collections', 'trending', 'dashboard',
  'enterprise', 'pricing', 'about', 'readme', 'copilot', 'security', 'site', 'contact', 'stars', 'watching', 'account']);
const ACTIVITY = { pull: 'review', pulls: 'review', compare: 'review', issues: 'issues', blob: 'code', tree: 'code', edit: 'editing',
  commit: 'history', commits: 'history', blame: 'history', actions: 'ci', wiki: 'docs', releases: 'releases', discussions: 'issues' };

export default {
  id: 'github',
  name: 'GitHub',
  hosts: ['github.com'],

  async classify({ url }, { config }) {
    const [owner, repo, kind, number] = url.pathname.split('/').filter(Boolean);
    if (!repo || RESERVED.has(owner.toLowerCase())) return null;
    const mine = config.owner && owner.toLowerCase() === config.owner.toLowerCase();
    const project = mine ? { id: repo, type: 'github' } : { id: `github:${owner}/${repo}`, type: 'github', public: false };
    return { project, activity: ACTIVITY[kind] ?? 'repo', site: 'code', meta: /^\d+$/.test(number ?? '') ? { kind, number: +number } : null };
  },

  async sync({ config, json }) {
    if (!config.owner) return [];
    const repos = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await json(`https://api.github.com/users/${config.owner}/repos?per_page=100&type=owner&page=${page}`);
      repos.push(...batch);
      if (batch.length < 100) break;
    }
    return repos.map(r => ({ id: r.name, type: 'github', name: r.name, url: r.html_url, public: !r.private,
      meta: { fork: r.fork, language: r.language } }));
  },
};
