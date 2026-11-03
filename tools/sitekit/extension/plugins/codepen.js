const VIEWS = { pen: 'editing', full: 'viewing', details: 'viewing', debug: 'viewing', live: 'viewing', embed: 'viewing' };
const unescape = s => s.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').replace(/&(amp|lt|gt|quot|#39);/g,
  (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]).trim();

export default {
  id: 'codepen',
  name: 'CodePen',
  hosts: ['codepen.io'],

  async classify({ url, title }, { config }) {
    const [user, view, slug] = url.pathname.split('/').filter(Boolean);
    if (user === 'pen' && !view) return { activity: 'editing', site: 'code' };
    if (!VIEWS[view] || !slug) return null;
    const mine = (config.user ?? config.owner)?.toLowerCase() === user.toLowerCase();
    const name = mine ? title?.replace(/\s*[-|]\s*CodePen\s*$/i, '').replace(/^CodePen\s*-\s*/i, '') || null : null;
    return { project: { id: `pen:${slug}`, type: 'pen', name, url: `https://codepen.io/${user}/pen/${slug}`, public: mine ? null : false },
             activity: VIEWS[view], site: 'code' };
  },

  // Your public pens, from your profile's RSS feed (CodePen has no public API any more).
  async sync({ config, text }) {
    const user = config.user ?? config.owner;
    if (!user) return [];
    const rss = await text(`https://codepen.io/${user}/public/feed`);
    return [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]) => {
      const link = unescape(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '');
      const slug = link.match(/\/pen\/([^/?#]+)/)?.[1];
      return slug ? [{ id: `pen:${slug}`, type: 'pen', name: unescape(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? slug),
                       url: `https://codepen.io/${user}/pen/${slug}`, public: true }] : [];
    });
  },
};
