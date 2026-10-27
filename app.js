// يلا رياضة — السكربت المشترك: الهيدر/الفوتر، شريط الموبايل، الثيم، المتجر، المساعد.
// المباريات تُحمّل من Supabase Edge Function في supabase-football.js.
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* التخزين غير متاح — لا مشكلة */ } },
  };
  const readJson = (k, d) => { try { return JSON.parse(store.get(k, '') || 'null') ?? d; } catch { return d; } };

  const contact = 'https://romeo311020.github.io/Romany-Profile/';
  const current = location.pathname.split('/').pop() || 'index.html';

  /* ---------- الشعار (يتبدّل لونه مع الثيم) ---------- */
  const mark = '<svg class="mark" viewBox="0 0 128 128" aria-hidden="true"><rect class="m-bg" width="128" height="128" rx="30"/><path class="m-fg" d="M32 40L64 78M96 40L64 78M64 78V106" fill="none" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><circle class="m-ball" cx="64" cy="37" r="12.5"/></svg>';
  const brand = `<a class="brand" href="index.html" aria-label="يلا رياضة — الرئيسية">${mark}<span><b>يلا رياضة</b><small>YALLA RIYADA</small></span></a>`;

  /* ---------- الثيم: داكن (افتراضي) / فاتح ---------- */
  const root = document.documentElement;
  const applyTheme = (t) => { if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme'); };
  applyTheme(store.get('yr-theme'));

  /* ---------- الهيدر ---------- */
  const nav = [
    ['index.html', 'الرئيسية'], ['matches.html', 'المباريات'], ['news.html', 'الأخبار'],
    ['assistant.html', 'المساعد الذكي'], ['store.html', 'المتجر قريبًا'], ['account.html', 'حسابي'],
  ];
  const header = $('shared-header');
  if (header) {
    header.innerHTML = `<header class="header"><div class="wrap nav">${brand}
      <nav id="nav" aria-label="القائمة الرئيسية">${nav.map(([u, t]) => `<a class="${current === u ? 'active' : ''}" ${current === u ? 'aria-current="page"' : ''} href="${u}">${t}</a>`).join('')}<a href="${contact}" target="_blank" rel="noopener noreferrer">تواصل معنا ↗</a></nav>
      <button class="icon-btn" id="theme" type="button" aria-label="تبديل الوضع الفاتح/الداكن"></button>
      <button class="icon-btn menu" id="menu" type="button" aria-label="القائمة" aria-expanded="false">☰</button></div></header>`;
    const themeBtn = $('theme');
    const paintTheme = () => { themeBtn.textContent = root.getAttribute('data-theme') === 'light' ? '☾' : '☀'; };
    paintTheme();
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next); store.set('yr-theme', next); paintTheme();
    });
    $('menu').addEventListener('click', (e) => {
      const open = $('nav').classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- الفوتر ---------- */
  const footer = $('shared-footer');
  if (footer) {
    footer.innerHTML = `<footer class="footer"><div class="wrap foot">${brand}
      <div class="foot-links"><a href="matches.html">المباريات</a><a href="news.html">الأخبار</a><a href="assistant.html">Yalla AI</a><a href="store.html">المتجر قريبًا</a><a href="about.html">عن المنصة</a><a href="${contact}" target="_blank" rel="noopener noreferrer">تواصل معنا</a></div>
      <div class="credit">تصميم وتطوير <a href="${contact}" target="_blank" rel="noopener noreferrer">Romany Garges</a></div>
      <small class="copyright">© ${new Date().getFullYear()} YALLA RIYADA</small></div></footer>`;
  }

  /* ---------- شريط التنقل السفلي (موبايل) ---------- */
  const ico = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const tabs = [
    ['index.html', 'الرئيسية', ico('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>')],
    ['matches.html', 'المباريات', ico('<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/>')],
    ['assistant.html', 'المساعد', ico('<path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z"/>')],
    ['store.html', 'قريبًا', ico('<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>')],
    ['account.html', 'حسابي', ico('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')],
  ];
  const tabbar = document.createElement('nav');
  tabbar.className = 'tabbar';
  tabbar.setAttribute('aria-label', 'التنقل السريع');
  tabbar.innerHTML = tabs.map(([u, t, i]) => `<a href="${u}" class="${current === u ? 'active' : ''}" ${current === u ? 'aria-current="page"' : ''}>${i}<span>${t}</span></a>`).join('');
  document.body.appendChild(tabbar);

  /* ---------- زر رجوع داخل الموقع (صفحات التفاصيل) ---------- */
  const parents = { 'match.html': ['matches.html', 'المباريات'], 'product.html': ['store.html', 'المتجر'] };
  if (parents[current]) {
    const [href, label] = parents[current];
    const main = document.querySelector('main');
    const a = document.createElement('a');
    a.className = 'back'; a.href = href; a.textContent = `→ رجوع إلى ${label}`;
    a.addEventListener('click', (e) => {
      // لو جاء المستخدم من صفحة داخل نفس الموقع نرجع خطوة واحدة (يحفظ مكانه)، وإلا نذهب للصفحة الأم.
      try { if (document.referrer && new URL(document.referrer).origin === location.origin) { e.preventDefault(); history.back(); } } catch { /* نكمل بالرابط العادي */ }
    });
    main?.prepend(a);
  }


  /* ---------- مساعد تجريبي (ردود جاهزة، لا ذكاء اصطناعي حقيقي) ---------- */
  // المحادثات محفوظة على هذا الجهاز فقط (localStorage). كل النصوص تُعرض بـ textContent فلا تُنفَّذ كـ HTML.
  const canned = [
    [/تسلل/, 'اللاعب في موقف تسلل إذا كان أقرب لخط المرمى من الكرة ومن ثاني آخر مدافع لحظة تمرير زميله، وتُحتسب المخالفة فقط إذا شارك في اللعب.'],
    [/هاتريك/, 'هاتريك هو تسجيل اللاعب ثلاثة أهداف في مباراة واحدة.'],
    [/جزاء|بلنتي/, 'ركلة الجزاء تُحتسب عند ارتكاب مخالفة تستوجب ركلة حرة مباشرة داخل منطقة جزاء الفريق المدافع.'],
    [/ركن|كورنر/, 'الركنية تُمنح للمهاجمين عندما تتجاوز الكرة خط المرمى بعد أن لمسها آخر لاعب من الفريق المدافع.'],
  ];
  const fallback = 'هذه نسخة تجريبية لا تتصل بنموذج ذكاء اصطناعي حقيقي بعد. جرّب أحد الأسئلة المقترحة، وسيتم تفعيل الإجابات الموسعة عند ربط خدمة AI آمنة.';
  const box = $('messages');
  if (box) {
    let chats = readJson('yr-chats', []);
    if (!Array.isArray(chats)) chats = [];
    let active = chats.length ? chats[chats.length - 1].id : Date.now();
    const welcome = box.innerHTML; // رسالة الترحيب الموجودة في الـ HTML

    const save = () => { store.set('yr-chats', JSON.stringify(chats.slice(-30))); drawHistory(); };
    const drawHistory = () => {
      const el = $('history-list'); if (!el) return;
      el.replaceChildren(...chats.slice().reverse().map((c) => {
        const b = document.createElement('button'); b.type = 'button';
        b.textContent = String(c.title || 'محادثة جديدة').slice(0, 30);
        b.onclick = () => { active = c.id; drawChat(); };
        return b;
      }));
    };
    const drawChat = () => {
      const c = chats.find((x) => x.id === active);
      if (!c) { box.innerHTML = welcome; return; }
      box.replaceChildren(...c.items.map((x) => {
        const d = document.createElement('div');
        d.className = 'bubble ' + (x.who === 'user' ? 'user' : 'bot');
        d.textContent = x.text; d.dir = 'auto';
        return d;
      }));
      box.scrollTop = box.scrollHeight;
    };
    const send = (raw) => {
      const t = String(raw).trim().slice(0, 500); if (!t) return;
      let c = chats.find((x) => x.id === active);
      if (!c) { c = { id: active, title: t, items: [] }; chats.push(c); }
      else if (!c.title || c.title === 'محادثة جديدة') c.title = t;
      c.items.push({ who: 'user', text: t });
      const hit = canned.find((x) => x[0].test(t));
      c.items.push({ who: 'bot', text: hit ? hit[1] : fallback });
      save(); drawChat();
    };
    $('chat-form')?.addEventListener('submit', (e) => { e.preventDefault(); const i = $('question'); send(i.value); i.value = ''; });
    document.querySelectorAll('.suggestions button').forEach((b) => { b.type = 'button'; b.onclick = () => send(b.textContent); });
    $('new-chat')?.addEventListener('click', () => {
      active = Date.now();
      chats.push({ id: active, title: 'محادثة جديدة', items: [{ who: 'bot', text: 'بدأنا محادثة جديدة. اكتب سؤالك الرياضي.' }] });
      save(); drawChat();
    });
    const q = $('question'); if (q) q.maxLength = 500;
    drawHistory();
    if (chats.some((c) => c.id === active)) drawChat();
  }
})();
