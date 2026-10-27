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
    if (error) throw error;
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

  if (location.pathname.endsWith('matches.html')) {
    const host = document.getElementById('matches-list');
    if (!host) return;

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
      try {
        const data = await request({ action: 'fixtures', date: localDate(dateOffsets[day] ?? 0) });
        const fixtures = Array.isArray(data?.fixtures) ? data.fixtures : [];
        host.innerHTML = fixtures.map((match) => renderFixture(match, day)).join('')
          || '<p class="note">لم يعثر المزوّد على مباريات متاحة لهذا اليوم ضمن باقتك.</p>';
      } catch (error) {
        console.error('Could not load API-Football fixtures:', error);
        host.innerHTML = `<p class="note">تعذّر تحميل المباريات: ${escapeHtml(error.message || 'خطأ غير معروف')}. حاول مرة أخرى لاحقًا.</p>`;
      } finally {
        buttons.forEach((button) => { button.disabled = false; });
      }
    }

    loadMatches(selectedDay);
  }

  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
    const host = document.getElementById('home-matches');
    if (!host) return;

    const note = host.nextElementSibling;
    host.innerHTML = '<p class="note">جارٍ تحميل مباريات اليوم...</p>';
    (async () => {
      try {
        const data = await request({ action: 'fixtures', date: localDate(0) });
        const fixtures = Array.isArray(data?.fixtures) ? data.fixtures.slice(0, 3) : [];
        host.innerHTML = fixtures.map((match) => renderFixture(match, 'today')).join('')
          || '<p class="note">لا توجد مباريات متاحة اليوم ضمن باقتك.</p>';
        if (note) note.textContent = 'مواعيد ونتائج حقيقية من API-Football، بتوقيت القاهرة.';
      } catch (error) {
        console.error('Could not load today’s API-Football fixtures:', error);
        host.innerHTML = '<p class="note">تعذّر تحميل المباريات. افتح مركز المباريات أو تحقق من إعداد الخدمة.</p>';
        if (note) note.textContent = 'سيتم عرض المباريات الحقيقية بعد تفعيل خدمة البيانات.';
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
    const backLink = document.createElement('a');
    backLink.className = 'back';
    backLink.href = `matches.html?day=${encodeURIComponent(new URLSearchParams(location.search).get('day') || 'today')}`;
    backLink.textContent = '→ العودة إلى المباريات';
    document.querySelector('main')?.prepend(backLink);
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
      } catch (error) {
        console.error('Could not load API-Football fixture:', error);
        if (note) note.textContent = `تعذّر تحميل تفاصيل المباراة: ${error.message || 'خطأ غير معروف'}.`;
      }
    })();
  }
})();
