(() => {
  'use strict';

  const db = window.yrSupabase;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const safeLogo = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };
  const localDate = (offset) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return new Date(Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day) + offset,
    )).toISOString().slice(0, 10);
  };
  const formatDate = (value) => value
    ? new Date(value).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })
    : 'الموعد لم يحدد';
  const cairoDay = (value) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
  const teamMarkup = (name, logo) => {
    const image = safeLogo(logo);
    return `<div class="team"><span class="crest">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : '⚽'}</span>${escapeHtml(name)}</div>`;
  };
  const statusMarkup = (status) => {
    if (status === 'live') return '<span class="tag live">مباشر</span>';
    if (status === 'finished') return '<span class="tag">انتهت</span>';
    return '<span class="tag">قادمة</span>';
  };
  const request = async (body) => {
    if (!db) throw new Error('إعدادات Supabase غير مكتملة.');
    const { data, error } = await db.functions.invoke('football-matches', { body });
    if (error) {
      if (/failed to send a request to the edge function/i.test(error.message || '')) {
        throw new Error('تعذّر الوصول إلى وظيفة Supabase. تأكد من نشر football-matches على مشروع Supabase الصحيح.');
      }
      throw error;
    }
    if (data?.error) throw new Error(data.error);
    return data;
  };
  const renderFixture = (match, day) => {
    const score = match.home_score == null || match.away_score == null
      ? '– : –'
      : `${escapeHtml(match.home_score)} : ${escapeHtml(match.away_score)}`;
    return `<a class="match" href="match.html?fixture=${encodeURIComponent(match.fixture_id)}&day=${encodeURIComponent(day)}">
      <div class="match-meta"><span>${escapeHtml(match.league || 'كرة القدم')}</span>${statusMarkup(match.status)}</div>
      <div class="teams">${teamMarkup(match.home_team, match.home_logo)}<div class="score">${score}</div>${teamMarkup(match.away_team, match.away_logo)}</div>
      <div class="match-foot"><span>${formatDate(match.kickoff)}</span><span>التفاصيل ←</span></div>
    </a>`;
  };
  const renderManualMatch = (match) => {
    const score = match.home_score == null || match.away_score == null
      ? '– : –'
      : `${escapeHtml(match.home_score)} : ${escapeHtml(match.away_score)}`;
    return `<a class="match" href="match.html?id=${encodeURIComponent(match.id)}">
      <div class="match-meta"><span>${escapeHtml(match.league || 'كرة القدم')}</span>${statusMarkup(match.status)}</div>
      <div class="teams">${teamMarkup(match.home_team)}<div class="score">${score}</div>${teamMarkup(match.away_team)}</div>
      <div class="match-foot"><span>${formatDate(match.kickoff)}</span><span>التفاصيل ←</span></div>
    </a>`;
  };
  const loadManualMatches = async (day) => {
    const { data, error } = await db
      .from('matches')
      .select('id,home_team,away_team,league,kickoff,status,home_score,away_score')
      .eq('is_published', true)
      .order('kickoff', { ascending: true })
      .limit(100);
    if (error) throw error;

    const targetDay = localDate(({ yesterday: -1, today: 0, tomorrow: 1 })[day] ?? 0);
    return (data || []).filter((match) => {
      if (!match.kickoff) return day === 'today';
      const timestamp = new Date(match.kickoff).getTime();
      return Number.isFinite(timestamp) && cairoDay(timestamp) === targetDay;
    });
  };
  const renderMatches = (fixtures, manualMatches, day) => [
    ...fixtures.map((match) => ({ match, manual: false })),
    ...manualMatches.map((match) => ({ match, manual: true })),
  ]
    .sort((left, right) => {
      const leftTime = left.match.kickoff ? new Date(left.match.kickoff).getTime() : Infinity;
      const rightTime = right.match.kickoff ? new Date(right.match.kickoff).getTime() : Infinity;
      return leftTime - rightTime;
    })
    .map(({ match, manual }) => manual ? renderManualMatch(match) : renderFixture(match, day))
    .join('');

  if (location.pathname.endsWith('matches.html')) {
    const host = document.getElementById('matches-list');
    if (!host) return;

    const sourceNote = host.nextElementSibling;
    const buttons = [...document.querySelectorAll('[data-day]')];
    const dateOffsets = { yesterday: -1, today: 0, tomorrow: 1 };
    const url = new URL(window.location.href);
    const initialDay = url.searchParams.get('day');
    const selectedDay = dateOffsets[initialDay] === undefined ? 'today' : initialDay;
    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.day === selectedDay);
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.toggle('active', item === button));
        loadMatches(button.dataset.day);
      });
    });

    async function loadMatches(day) {
      if (!db) {
        host.innerHTML = '<p class="note">بيانات Supabase غير مكتملة. أضف رابط المشروع وPublishable key لتفعيل المباريات.</p>';
        return;
      }

      buttons.forEach((button) => { button.disabled = true; });
      host.innerHTML = '<p class="note">جارٍ تحميل المباريات...</p>';
      const [apiResult, manualResult] = await Promise.allSettled([
        request({ action: 'fixtures', date: localDate(dateOffsets[day] ?? 0) }),
        loadManualMatches(day),
      ]);
      const fixtures = apiResult.status === 'fulfilled' && Array.isArray(apiResult.value?.fixtures)
        ? apiResult.value.fixtures
        : [];
      const manualMatches = manualResult.status === 'fulfilled' ? manualResult.value : [];
      const errors = [];
      if (apiResult.status === 'rejected') {
        console.error('Could not load API-Football fixtures:', apiResult.reason);
        errors.push(`تعذّر تحميل مباريات المزوّد: ${escapeHtml(apiResult.reason.message || 'خطأ غير معروف')}.`);
      }
      if (manualResult.status === 'rejected') {
        console.error('Could not load published manual matches:', manualResult.reason);
        errors.push(`تعذّر تحميل المباريات اليدوية: ${escapeHtml(manualResult.reason.message || 'خطأ غير معروف')}.`);
      }

      const cards = renderMatches(fixtures, manualMatches, day);
      host.innerHTML = [
        ...errors.map((message) => `<p class="note">${message}</p>`),
        cards || `<p class="note">${errors.length ? 'لم يتسنّ تحميل المباريات.' : 'لا توجد مباريات متاحة لهذا اليوم.'}</p>`,
      ].join('');
      if (sourceNote) {
        sourceNote.textContent = apiResult.status === 'rejected'
          ? 'تظهر المباريات المنشورة يدويًا حتى عند توقف خدمة البيانات.'
          : 'تُعرض مباريات المزوّد والمباريات المنشورة يدويًا، بتوقيت القاهرة.';
      }
      buttons.forEach((button) => { button.disabled = false; });
    }

    loadMatches(selectedDay);
  }

  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
    const host = document.getElementById('home-matches');
    if (!host) return;

    const note = host.nextElementSibling;
    host.innerHTML = '<p class="note">جارٍ تحميل مباريات اليوم...</p>';
    (async () => {
      const [apiResult, manualResult] = await Promise.allSettled([
        request({ action: 'fixtures', date: localDate(0) }),
        loadManualMatches('today'),
      ]);
      const fixtures = apiResult.status === 'fulfilled' && Array.isArray(apiResult.value?.fixtures)
        ? apiResult.value.fixtures.slice(0, 3)
        : [];
      const manualMatches = manualResult.status === 'fulfilled' ? manualResult.value : [];
      if (apiResult.status === 'rejected') {
        console.error('Could not load today’s API-Football fixtures:', apiResult.reason);
      }
      if (manualResult.status === 'rejected') {
        console.error('Could not load published manual matches:', manualResult.reason);
      }

      const cards = renderMatches(fixtures, manualMatches, 'today');
      host.innerHTML = cards || '<p class="note">لا توجد مباريات منشورة اليوم حاليًا.</p>';
      if (note) {
        const issues = [];
        if (apiResult.status === 'rejected') {
          issues.push(`تعذّر تحميل مباريات المزوّد: ${apiResult.reason?.message || 'خطأ غير معروف'}.`);
        }
        if (manualResult.status === 'rejected') {
          issues.push(`تعذّر تحميل المباريات المنشورة: ${manualResult.reason?.message || 'خطأ غير معروف'}.`);
        }
        note.textContent = issues.join(' ') || 'مباريات من API-Football والمباريات المنشورة يدويًا، بتوقيت القاهرة.';
      }
    })();
  }

  if (location.pathname.endsWith('match.html')) {
    const fixtureId = new URLSearchParams(location.search).get('fixture');
    if (!fixtureId) return;

    const title = document.getElementById('match-title');
    const score = document.getElementById('match-score');
    const note = document.querySelector('main .panel .note');
    const details = document.querySelector('.detail-grid');
    const day = new URLSearchParams(location.search).get('day') || 'today';
    const backLink = document.querySelector('main .back') || document.createElement('a');
    backLink.className = 'back';
    backLink.href = `matches.html?day=${encodeURIComponent(day)}`;
    backLink.textContent = '→ العودة إلى المباريات';
    if (!backLink.parentElement) document.querySelector('main')?.prepend(backLink);
    if (details) details.hidden = true;

    if (!db) {
      if (note) note.textContent = 'بيانات Supabase غير مكتملة، تعذّر تحميل تفاصيل المباراة.';
      return;
    }

    (async () => {
      if (note) note.textContent = 'جارٍ تحميل تفاصيل المباراة...';
      try {
        const data = await request({ action: 'fixture', fixtureId: Number(fixtureId) });
        const match = data?.fixture;
        if (!match) {
          if (note) note.textContent = 'المباراة غير متاحة من المزوّد حاليًا.';
          return;
        }

        if (title) title.textContent = `${match.home_team} × ${match.away_team}`;
        if (score) {
          const result = match.home_score == null || match.away_score == null
            ? '– : –'
            : `${escapeHtml(match.home_score)} : ${escapeHtml(match.away_score)}`;
          score.innerHTML = `${teamMarkup(match.home_team, match.home_logo)}<div class="score">${result}</div>${teamMarkup(match.away_team, match.away_logo)}`;
        }
        if (note) {
          const state = match.status === 'live' ? 'مباشرة' : match.status === 'finished' ? 'انتهت' : 'قادمة';
          note.textContent = `${match.league} · ${formatDate(match.kickoff)} · ${state}`;
        }

        const player = document.getElementById('match-player');
        const playerFrame = document.getElementById('match-player-frame');
        if (player && playerFrame) {
          const { data: stream, error: streamError } = await db
            .from('fixture_streams')
            .select('embed_url')
            .eq('fixture_id', Number(fixtureId))
            .maybeSingle();
          player.hidden = false;
          if (streamError) {
            console.error('Could not load the authorized match player:', streamError);
            playerFrame.textContent = 'تعذّر تحميل المشغّل. تأكد من تحديث قاعدة البيانات في إعداد Supabase.';
          } else if (stream?.embed_url && safeLogo(stream.embed_url)) {
            const frame = document.createElement('iframe');
            frame.src = stream.embed_url;
            frame.title = `مشغّل مباراة ${match.home_team} ضد ${match.away_team}`;
            frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            frame.allowFullscreen = true;
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            frame.sandbox = 'allow-scripts allow-same-origin allow-presentation';
            playerFrame.replaceChildren(frame);
          } else {
            playerFrame.textContent = 'لم يضف المسؤول مشغّلًا رسميًا لهذه المباراة بعد.';
          }
        }
      } catch (error) {
        console.error('Could not load API-Football fixture:', error);
        if (note) note.textContent = `تعذّر تحميل تفاصيل المباراة: ${error.message || 'خطأ غير معروف'}.`;
      }
    })();
  }
})();
