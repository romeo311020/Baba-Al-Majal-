// يلا رياضة — صفحات المباريات (الرئيسية، مركز المباريات، تفاصيل المباراة).
// البيانات الحقيقية تأتي من دالة Supabase `football-matches` (المفتاح السري يبقى هناك).
(() => {
  'use strict';

  const db = window.yrSupabase;
  const $ = (id) => document.getElementById(id);
  const page = location.pathname.split('/').pop() || 'index.html';

  /* ---------- أدوات ---------- */
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const safeUrl = (value) => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const cairoParts = (date) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(({ type, value }) => [type, value]));
  const localDate = (offset) => {
    const v = cairoParts(new Date());
    return new Date(Date.UTC(Number(v.year), Number(v.month) - 1, Number(v.day) + offset)).toISOString().slice(0, 10);
  };
  const cairoDay = (value) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  const formatDate = (value) => value ? new Date(value).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' }) : 'الموعد لم يحدد';
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }) : '—';
  const SPORT_ICON = { football: '⚽', basketball: '🏀' };
  const SPORT_NAME = { football: 'كرة القدم', basketball: 'كرة السلة' };

  const request = async (body) => {
    if (!db) throw new Error('إعدادات Supabase غير مكتملة.');
    const { data, error } = await db.functions.invoke('football-matches', { body });
    if (error) {
      if (/failed to send a request to the edge function/i.test(error.message || '')) {
        throw new Error('تعذّر الوصول إلى دالة المباريات. تأكد من نشر football-matches (واسمها بالظبط) وإيقاف Verify JWT.');
      }
      throw error;
    }
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const teamMarkup = (name, logo, sport = 'football') => {
    const image = safeUrl(logo);
    return `<div class="team"><span class="crest">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : SPORT_ICON[sport] || '⚽'}</span><span class="team-name">${escapeHtml(name)}</span></div>`;
  };
  const statusTag = (m) => {
    if (m.status === 'live') return `<span class="tag live">● مباشر${m.minute ? ` · ${escapeHtml(m.minute)}'` : ''}</span>`;
    if (m.status === 'finished') return '<span class="tag">انتهت</span>';
    if (m.status_note) return `<span class="tag">${escapeHtml(m.status_note)}</span>`;
    return '<span class="tag">قادمة</span>';
  };
  const centerMarkup = (m) => {
    if (m.home_score == null || m.away_score == null) return `<div class="kick">${escapeHtml(formatTime(m.kickoff))}</div>`;
    return `<div class="score">${escapeHtml(m.home_score)} : ${escapeHtml(m.away_score)}</div>`;
  };
  const fixtureCard = (m, ctx) => `<a class="match" href="match.html?fixture=${encodeURIComponent(m.fixture_id)}&sport=${encodeURIComponent(m.sport || 'football')}&day=${encodeURIComponent(ctx.day)}">
      <div class="match-meta"><span>${escapeHtml(m.league_label || m.league || '')}</span>${statusTag(m)}</div>
      <div class="teams">${teamMarkup(m.home_team, m.home_logo, m.sport)}${centerMarkup(m)}${teamMarkup(m.away_team, m.away_logo, m.sport)}</div>
      <div class="match-foot"><span>${escapeHtml(formatDate(m.kickoff))}</span><span>التفاصيل ←</span></div>
    </a>`;
  const manualCard = (m) => `<a class="match" href="match.html?id=${encodeURIComponent(m.id)}">
      <div class="match-meta"><span>${escapeHtml(m.league || 'كرة القدم')}</span>${statusTag(m)}</div>
      <div class="teams">${teamMarkup(m.home_team)}${centerMarkup(m)}${teamMarkup(m.away_team)}</div>
      <div class="match-foot"><span>${escapeHtml(formatDate(m.kickoff))}</span><span>التفاصيل ←</span></div>
    </a>`;

  const loadManualMatches = async (day) => {
    const { data, error } = await db.from('matches')
      .select('id,home_team,away_team,league,kickoff,status,home_score,away_score')
      .eq('is_published', true).order('kickoff', { ascending: true }).limit(100);
    if (error) throw error;
    const target = localDate({ yesterday: -1, today: 0, tomorrow: 1 }[day] ?? 0);
    return (data || []).filter((m) => {
      if (!m.kickoff) return day === 'today';
      const t = new Date(m.kickoff).getTime();
      return Number.isFinite(t) && cairoDay(t) === target;
    }).map((m) => ({ ...m, manual: true, league_key: 'manual', league_label: m.league || 'مباريات منشورة' }));
  };

  /* ---------- بحث: توحيد الحروف العربية + أسماء عربية شائعة للفرق ---------- */
  const norm = (s) => String(s ?? '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ').trim();
  const ALIASES = {
    'real madrid': 'ريال مدريد', barcelona: 'برشلونة', atletico: 'أتلتيكو مدريد', sevilla: 'إشبيلية', valencia: 'فالنسيا', villarreal: 'فياريال', 'real sociedad': 'ريال سوسيداد', 'athletic club': 'أتلتيك بلباو', betis: 'ريال بيتيس',
    'manchester city': 'مانشستر سيتي', 'manchester united': 'مانشستر يونايتد', liverpool: 'ليفربول', arsenal: 'أرسنال', chelsea: 'تشيلسي', tottenham: 'توتنهام', newcastle: 'نيوكاسل', 'aston villa': 'أستون فيلا', 'west ham': 'وست هام', brighton: 'برايتون', everton: 'إيفرتون',
    bayern: 'بايرن ميونخ', dortmund: 'دورتموند', 'paris saint': 'باريس سان جيرمان', juventus: 'يوفنتوس', inter: 'إنتر ميلان', milan: 'ميلان', napoli: 'نابولي', roma: 'روما', benfica: 'بنفيكا', porto: 'بورتو', ajax: 'أياكس', psv: 'آيندهوفن',
    'al ahly': 'الأهلي', zamalek: 'الزمالك', pyramids: 'بيراميدز', 'al masry': 'المصري', ismaily: 'الإسماعيلي', 'future fc': 'فيوتشر', ceramica: 'سيراميكا كليوباترا', enppi: 'إنبي', pharco: 'فاركو', smouha: 'سموحة', 'modern': 'مودرن', 'ghazl': 'غزل المحلة', 'el gouna': 'الجونة', 'national bank': 'البنك الأهلي',
    sundowns: 'صن داونز', esperance: 'الترجي', wydad: 'الوداد', raja: 'الرجاء', mazembe: 'مازيمبي',
    lakers: 'ليكرز', celtics: 'سلتيكس', warriors: 'واريرز', bulls: 'بولز', heat: 'هيت', nets: 'نتس', knicks: 'نيكس', bucks: 'باكس', suns: 'صنز', mavericks: 'مافريكس', nuggets: 'ناجتس', clippers: 'كليبرز', spurs: 'سبيرز', fenerbahce: 'فنربخشة', olympiacos: 'أولمبياكوس', panathinaikos: 'باناثينايكوس',
  };
  const ALIAS_RULES = Object.entries(ALIASES).map(([k, v]) => [new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), v]);
  const aliasesFor = (name) => ALIAS_RULES.filter(([re]) => re.test(name)).map(([, ar]) => ar).join(' ');
  const haystack = (m) => norm(`${m.home_team} ${m.away_team} ${m.league || ''} ${m.league_label || ''} ${aliasesFor(m.home_team)} ${aliasesFor(m.away_team)}`);

  /* ======================================================================
     صفحة مركز المباريات
     ====================================================================== */
  if (page === 'matches.html') {
    const host = $('matches-list');
    if (!host) return;
    const params = new URLSearchParams(location.search);
    const DAYS = ['yesterday', 'today', 'tomorrow'];
    const offsets = { yesterday: -1, today: 0, tomorrow: 1 };
    const state = {
      sport: SPORT_NAME[params.get('sport')] ? params.get('sport') : 'football',
      day: DAYS.includes(params.get('day')) ? params.get('day') : 'today',
      league: params.get('league') || 'all',
      q: '',
    };
    let data = { fixtures: [], leagues: [], manual: [], error: '' };
    let token = 0;

    const syncUrl = () => {
      const p = new URLSearchParams({ sport: state.sport, day: state.day });
      if (state.league !== 'all') p.set('league', state.league);
      try { history.replaceState(null, '', `?${p}`); } catch { /* لا مشكلة */ }
    };
    const paintControls = () => {
      document.querySelectorAll('[data-sport]').forEach((b) => { const on = b.dataset.sport === state.sport; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
      document.querySelectorAll('[data-day]').forEach((b) => { const on = b.dataset.day === state.day; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      const sub = $('mc-sub');
      if (sub) sub.textContent = state.sport === 'football'
        ? 'أهم البطولات: دوري أبطال أوروبا وأفريقيا، الدوري الإنجليزي والإسباني والمصري.'
        : 'أهم البطولات: NBA ويوروليغ.';
    };

    const all = () => (state.sport === 'football' ? [...data.fixtures, ...data.manual] : data.fixtures);
    const renderChips = () => {
      const box = $('league-chips'); if (!box) return;
      const list = all();
      const chips = [{ key: 'all', label: 'كل البطولات المهمة', n: list.length }, ...data.leagues.map((l) => ({ key: l.key, label: l.label, n: list.filter((m) => m.league_key === l.key).length }))];
      if (state.sport === 'football' && data.manual.length) chips.push({ key: 'manual', label: 'مباريات منشورة', n: data.manual.length });
      box.innerHTML = chips.map((c) => `<button type="button" class="chip${state.league === c.key ? ' active' : ''}" data-league="${escapeHtml(c.key)}" aria-pressed="${state.league === c.key}">${escapeHtml(c.label)} <span class="chip-n">${c.n}</span></button>`).join('');
    };
    const render = () => {
      paintControls(); renderChips();
      const q = norm(state.q);
      const rows = all()
        .filter((m) => state.league === 'all' || m.league_key === state.league)
        .filter((m) => !q || q.split(' ').every((w) => haystack(m).includes(w)));
      const count = $('results-count');
      if (data.error && !rows.length) {
        host.innerHTML = `<div class="empty-state"><p>${escapeHtml(data.error)}</p><button class="btn outline" type="button" id="retry">إعادة المحاولة</button></div>`;
        if (count) count.textContent = '';
        return;
      }
      if (!rows.length) {
        host.innerHTML = `<div class="empty-state"><p>${q ? 'لا توجد مباريات مطابقة لبحثك.' : `لا توجد مباريات ${SPORT_NAME[state.sport]} في البطولات المهمة لهذا اليوم.`}</p>${q || state.league !== 'all' ? '<button class="btn outline" type="button" id="reset-filters">إزالة التصفية</button>' : ''}</div>`;
        if (count) count.textContent = '';
        return;
      }
      // تجميع حسب البطولة بترتيب القائمة، والمباشر أولًا ثم الأقرب موعدًا
      const order = [...data.leagues.map((l) => l.key), 'manual'];
      const groups = new Map();
      rows.forEach((m) => { if (!groups.has(m.league_key)) groups.set(m.league_key, []); groups.get(m.league_key).push(m); });
      const rank = (m) => (m.status === 'live' ? 0 : 1);
      const keys = [...groups.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
      host.innerHTML = keys.map((k) => {
        const items = groups.get(k).sort((a, b) => rank(a) - rank(b) || new Date(a.kickoff || 0) - new Date(b.kickoff || 0));
        const logo = safeUrl(items.find((m) => m.league_logo)?.league_logo);
        return `<section class="league-group" aria-label="${escapeHtml(items[0].league_label)}">
          <h2 class="league-title">${logo ? `<img src="${escapeHtml(logo)}" alt="" loading="lazy">` : ''}<span>${escapeHtml(items[0].league_label)}</span><small>${items.length}</small></h2>
          <div class="match-grid">${items.map((m) => (m.manual ? manualCard(m) : fixtureCard(m, state))).join('')}</div></section>`;
      }).join('');
      if (count) count.textContent = `${rows.length} ${rows.length === 1 ? 'مباراة' : 'مباراة'}${q ? ' مطابقة للبحث' : ''}`;
    };

    async function load() {
      const my = ++token;
      host.setAttribute('aria-busy', 'true');
      host.innerHTML = '<div class="skeleton-list" aria-hidden="true"><div></div><div></div><div></div></div>';
      $('results-count') && ($('results-count').textContent = 'جارٍ التحميل…');
      data = { fixtures: [], leagues: [], manual: [], error: '' };
      if (!db) { data.error = 'بيانات Supabase غير مكتملة. أضف رابط المشروع والمفتاح في supabase-config.js.'; host.removeAttribute('aria-busy'); return render(); }
      const [api, manual] = await Promise.allSettled([
        request({ action: 'fixtures', sport: state.sport, date: localDate(offsets[state.day]) }),
        state.sport === 'football' ? loadManualMatches(state.day) : Promise.resolve([]),
      ]);
      if (my !== token) return; // وصل رد قديم بعد تغيير الاختيار
      if (api.status === 'fulfilled') { data.fixtures = api.value?.fixtures || []; data.leagues = api.value?.leagues || []; }
      else { console.error('matches:', api.reason); data.error = `تعذّر تحميل المباريات: ${api.reason?.message || 'خطأ غير معروف'}`; }
      if (manual.status === 'fulfilled') data.manual = manual.value;
      host.removeAttribute('aria-busy');
      if (state.league !== 'all' && !data.leagues.some((l) => l.key === state.league) && state.league !== 'manual') state.league = 'all';
      render();
    }

    /* أحداث */
    document.querySelectorAll('[data-sport]').forEach((b) => b.addEventListener('click', () => { if (state.sport === b.dataset.sport) return; state.sport = b.dataset.sport; state.league = 'all'; syncUrl(); load(); }));
    document.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { if (state.day === b.dataset.day) return; state.day = b.dataset.day; syncUrl(); load(); }));
    $('league-chips')?.addEventListener('click', (e) => { const b = e.target.closest('[data-league]'); if (!b) return; state.league = b.dataset.league; syncUrl(); render(); });
    host.addEventListener('click', (e) => {
      if (e.target.closest('#retry')) load();
      if (e.target.closest('#reset-filters')) { state.q = ''; state.league = 'all'; $('match-search').value = ''; $('search-clear').hidden = true; syncUrl(); render(); }
    });
    const input = $('match-search'); const clear = $('search-clear');
    let timer;
    input?.addEventListener('input', () => { clear.hidden = !input.value; clearTimeout(timer); timer = setTimeout(() => { state.q = input.value; render(); }, 150); });
    input?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; clear.click(); } });
    clear?.addEventListener('click', () => { input.value = ''; clear.hidden = true; state.q = ''; render(); input.focus(); });

    paintControls(); syncUrl(); load();
  }

  /* ======================================================================
     الصفحة الرئيسية: مباريات اليوم المهمة
     ====================================================================== */
  if (page === 'index.html' || page === '') {
    const host = $('home-matches');
    if (!host) return;
    const note = host.nextElementSibling;
    host.innerHTML = '<p class="note">جارٍ تحميل مباريات اليوم…</p>';
    (async () => {
      const [api, manual] = await Promise.allSettled([request({ action: 'fixtures', sport: 'football', date: localDate(0) }), loadManualMatches('today')]);
      const fixtures = api.status === 'fulfilled' ? (api.value?.fixtures || []).slice().sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1) || new Date(a.kickoff || 0) - new Date(b.kickoff || 0)).slice(0, 3) : [];
      const manuals = manual.status === 'fulfilled' ? manual.value : [];
      if (api.status === 'rejected') console.error('home matches:', api.reason);
      const cards = [...fixtures.map((m) => fixtureCard(m, { day: 'today' })), ...manuals.map(manualCard)].join('');
      host.innerHTML = cards || '<p class="note">لا توجد مباريات في البطولات المهمة اليوم.</p>';
      if (note) note.textContent = api.status === 'rejected' ? `تعذّر تحميل المباريات: ${api.reason?.message || 'خطأ غير معروف'}` : 'أهم مباريات اليوم، بتوقيت القاهرة.';
    })();
  }

  /* ======================================================================
     تفاصيل المباراة
     ====================================================================== */
  if (page === 'match.html') {
    const p = new URLSearchParams(location.search);
    const fixtureId = p.get('fixture');
    if (!fixtureId) return;
    const sport = p.get('sport') === 'basketball' ? 'basketball' : 'football';
    const day = ['yesterday', 'today', 'tomorrow'].includes(p.get('day')) ? p.get('day') : 'today';
    const title = $('match-title'); const score = $('match-score');
    const note = document.querySelector('main .panel .note');
    const details = document.querySelector('.detail-grid');
    const player = $('match-player'); const frameBox = $('match-player-frame');
    if (details) details.hidden = true;
    if (player) player.hidden = true; // يظهر فقط لو أضاف المسؤول رابط مشغّل رسمي
    const back = document.querySelector('main .back');
    if (back) back.href = `matches.html?sport=${sport}&day=${day}`;

    if (!db) { if (note) note.textContent = 'بيانات Supabase غير مكتملة، تعذّر تحميل تفاصيل المباراة.'; return; }
    (async () => {
      try {
        const res = await request({ action: 'fixture', sport, fixtureId: Number(fixtureId) });
        const m = res?.fixture;
        if (!m) { if (note) note.textContent = 'المباراة غير متاحة من المزوّد حاليًا.'; return; }
        title.textContent = `${m.home_team} × ${m.away_team}`;
        document.title = `${m.home_team} × ${m.away_team} | يلا رياضة`;
        score.innerHTML = `${teamMarkup(m.home_team, m.home_logo, sport)}${centerMarkup(m)}${teamMarkup(m.away_team, m.away_logo, sport)}`;
        if (note) note.textContent = `${m.league_label || m.league} · ${formatDate(m.kickoff)} · ${m.status === 'live' ? 'مباشرة' : m.status === 'finished' ? 'انتهت' : m.status_note || 'قادمة'}`;

        // المشغّل: لكرة القدم فقط حاليًا (جدول fixture_streams مفتاحه رقم المباراة)، ولا يظهر إلا لو يوجد رابط
        if (sport === 'football' && player && frameBox) {
          const { data: stream, error } = await db.from('fixture_streams').select('embed_url').eq('fixture_id', Number(fixtureId)).maybeSingle();
          if (error) { console.error('stream lookup:', error); return; }
          const url = safeUrl(stream?.embed_url);
          if (!url) return;
          const frame = document.createElement('iframe');
          frame.src = url;
          frame.title = `مشغّل مباراة ${m.home_team} ضد ${m.away_team}`;
          frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
          frame.allowFullscreen = true;
          frame.referrerPolicy = 'strict-origin-when-cross-origin';
          frame.sandbox = 'allow-scripts allow-same-origin allow-presentation';
          frameBox.replaceChildren(frame);
          player.hidden = false;
        }
      } catch (error) {
        console.error('match details:', error);
        if (note) note.textContent = `تعذّر تحميل تفاصيل المباراة: ${error.message || 'خطأ غير معروف'}.`;
      }
    })();
  }
})();
