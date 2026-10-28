(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const client = window.yrSupabase;
  const loginPanel = $('admin-login-panel');
  const workspace = $('admin-workspace');
  const logoutButton = $('admin-logout');
  let currentUser = null;

  const say = (id, message) => {
    const element = $(id);
    if (element) element.textContent = message;
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const validHttpsUrl = (value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  };
  const localDateTimeValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  if (!client) {
    say('admin-auth-message', 'أكمل إعداد supabase-config.js أولًا، ثم ارفع الملفات إلى الموقع.');
    return;
  }

  async function checkSession() {
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data.session) await verifyAdmin(data.session.user);
      else {
        loginPanel.hidden = false;
        workspace.hidden = true;
      }
    } catch (error) {
      say('admin-auth-message', `تعذّر التحقق من الجلسة: ${error.message}`);
    }
  }

  async function verifyAdmin(user) {
    const { data: profile, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      say('admin-auth-message', `تعذّر التحقق من صلاحيات الحساب: ${error.message}`);
      return;
    }
    if (profile?.role !== 'admin') {
      currentUser = null;
      workspace.hidden = true;
      loginPanel.hidden = false;
      logoutButton.hidden = false;
      say('admin-auth-message', 'هذا الحساب ليس مسؤولًا. يجب أن يعيّن مسؤول المشروع role=admin لهذا الحساب.');
      return;
    }

    currentUser = user;
    loginPanel.hidden = true;
    workspace.hidden = false;
    logoutButton.hidden = false;
    say('admin-auth-message', '');
    await Promise.all([loadMatches(), loadStreams(), loadProducts(), loadApiFixtures()]);
  }

  $('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    say('admin-auth-message', 'جارٍ التحقق...');
    const { data, error } = await client.auth.signInWithPassword({
      email: $('admin-email').value.trim(),
      password: $('admin-password').value,
    });
    if (error) {
      say('admin-auth-message', `تعذّر تسجيل الدخول: ${error.message}`);
      return;
    }
    await verifyAdmin(data.user);
  });

  logoutButton.addEventListener('click', async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      say('admin-auth-message', `تعذّر تسجيل الخروج: ${error.message}`);
      return;
    }
    currentUser = null;
    workspace.hidden = true;
    loginPanel.hidden = false;
    logoutButton.hidden = true;
    say('admin-auth-message', 'تم تسجيل الخروج.');
  });

  $('match-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    const embedUrl = $('match-embed').value.trim();
    if (embedUrl && !validHttpsUrl(embedUrl)) {
      say('match-message', 'يجب أن يكون رابط المشغّل آمنًا ويبدأ بـ https://');
      return;
    }

    say('match-message', 'جارٍ حفظ المباراة...');
    const kickoffValue = $('match-kickoff').value;
    const row = {
      sport: 'football',
      home_team: $('match-home').value.trim(),
      away_team: $('match-away').value.trim(),
      league: $('match-league').value.trim(),
      kickoff: kickoffValue ? new Date(kickoffValue).toISOString() : null,
      status: $('match-status').value,
      home_score: $('match-home-score').value === '' ? null : Number($('match-home-score').value),
      away_score: $('match-away-score').value === '' ? null : Number($('match-away-score').value),
      embed_url: embedUrl,
      notes: '',
      is_published: $('match-published').checked,
    };
    const editId = $('match-edit-id').value;
    const query = editId
      ? client.from('matches').update(row).eq('id', editId)
      : client.from('matches').insert(row);
    const { error } = await query;
    if (error) {
      say('match-message', `تعذّر حفظ المباراة: ${error.message}`);
      return;
    }
    resetMatchForm();
    say('match-message', editId ? 'تم تحديث المباراة.' : 'تمت إضافة المباراة.');
    await loadMatches();
  });

  function resetMatchForm() {
    $('match-form').reset();
    $('match-edit-id').value = '';
    $('match-published').checked = true;
    $('match-save').textContent = 'حفظ المباراة';
    $('match-cancel-edit').hidden = true;
  }

  $('match-cancel-edit').addEventListener('click', resetMatchForm);

  async function loadMatches() {
    const host = $('admin-matches');
    const { data, error } = await client
      .from('matches')
      .select('id,home_team,away_team,league,kickoff,status,home_score,away_score,embed_url,is_published')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      host.textContent = `تعذّر تحميل المباريات: ${error.message}`;
      return;
    }

    host.innerHTML = (data || []).map((match) => `<article class="admin-list-item">
      <div><strong>${escapeHtml(match.home_team)} × ${escapeHtml(match.away_team)}</strong>
        <small>${escapeHtml(match.league || 'كرة القدم')} · ${match.is_published ? 'منشورة' : 'مخفية'}</small></div>
      <div class="row">
        <button type="button" class="btn outline" data-edit-match="${escapeHtml(match.id)}">تعديل</button>
        <button type="button" class="btn outline" data-delete-match="${escapeHtml(match.id)}">حذف</button>
      </div>
    </article>`).join('') || '<p class="note">لا توجد مباريات يدوية بعد.</p>';

    host.querySelectorAll('[data-edit-match]').forEach((button) => {
      button.addEventListener('click', () => {
        const match = data.find((item) => item.id === button.dataset.editMatch);
        if (!match) return;
        $('match-edit-id').value = match.id;
        $('match-home').value = match.home_team;
        $('match-away').value = match.away_team;
        $('match-league').value = match.league || '';
        $('match-kickoff').value = localDateTimeValue(match.kickoff);
        $('match-status').value = match.status;
        $('match-home-score').value = match.home_score ?? '';
        $('match-away-score').value = match.away_score ?? '';
        $('match-embed').value = match.embed_url || '';
        $('match-published').checked = match.is_published;
        $('match-save').textContent = 'حفظ التعديلات';
        $('match-cancel-edit').hidden = false;
        $('match-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    host.querySelectorAll('[data-delete-match]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!window.confirm('هل تريد حذف هذه المباراة؟')) return;
        const { error: deleteError } = await client.from('matches').delete().eq('id', button.dataset.deleteMatch);
        say('match-message', deleteError ? `تعذّر حذف المباراة: ${deleteError.message}` : 'تم حذف المباراة.');
        if (!deleteError) await loadMatches();
      });
    });
  }

  $('stream-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    const fixtureId = Number($('stream-fixture-id').value);
    const embedUrl = $('stream-embed-url').value.trim();
    if (!Number.isSafeInteger(fixtureId) || fixtureId < 1) {
      say('stream-message', 'أدخل رقم مباراة صحيحًا من API-Football.');
      return;
    }
    if (!validHttpsUrl(embedUrl)) {
      say('stream-message', 'يجب أن يكون رابط المشغّل آمنًا ويبدأ بـ https://');
      return;
    }

    say('stream-message', 'جارٍ حفظ المشغّل...');
    const previousId = $('stream-edit-id').value;
    const row = {
      fixture_id: fixtureId,
      embed_url: embedUrl,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString(),
    };
    const result = previousId && Number(previousId) !== fixtureId
      ? await client.from('fixture_streams').update(row).eq('fixture_id', Number(previousId))
      : await client.from('fixture_streams').upsert(row, { onConflict: 'fixture_id' });
    if (result.error) {
      say('stream-message', `تعذّر حفظ المشغّل: ${result.error.message}. تأكد من تشغيل تحديث قاعدة البيانات في README.`);
      return;
    }

    resetStreamForm();
    say('stream-message', 'تم ربط المشغّل بالمباراة. سيظهر في صفحة تفاصيلها.');
    await loadStreams();
  });

  function resetStreamForm() {
    $('stream-form').reset();
    $('stream-edit-id').value = '';
    $('stream-save').textContent = 'حفظ المشغّل';
    $('stream-cancel-edit').hidden = true;
  }

  $('stream-cancel-edit').addEventListener('click', resetStreamForm);
  $('stream-fixture-day').addEventListener('change', loadApiFixtures);

  function cairoDate(offset) {
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
  }

  async function loadApiFixtures() {
    const select = $('stream-fixture-id');
    const offsets = { yesterday: -1, today: 0, tomorrow: 1 };
    const day = $('stream-fixture-day').value;
    select.innerHTML = '<option value="">جارٍ تحميل المباريات...</option>';
    say('stream-fixture-status', '');
    try {
      const { data, error } = await client.functions.invoke('football-matches', {
        body: { action: 'fixtures', date: cairoDate(offsets[day] ?? 0) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const fixtures = Array.isArray(data?.fixtures) ? data.fixtures : [];
      select.innerHTML = '<option value="">اختر مباراة</option>' + fixtures.map((fixture) => {
        const label = `${fixture.home_team} × ${fixture.away_team} · ${fixture.league} · #${fixture.fixture_id}`;
        return `<option value="${escapeHtml(fixture.fixture_id)}">${escapeHtml(label)}</option>`;
      }).join('');
      if (!fixtures.length) say('stream-fixture-status', 'لا توجد مباريات متاحة لهذا اليوم.');
    } catch (error) {
      console.error('Could not load fixtures for the admin player selector:', error);
      select.innerHTML = '<option value="">تعذّر تحميل قائمة المباريات</option>';
      say('stream-fixture-status', `تأكد من نشر football-matches وضبط API_FOOTBALL_KEY: ${error.message}`);
    }
  }

  async function loadStreams() {
    const host = $('admin-streams');
    const { data, error } = await client
      .from('fixture_streams')
      .select('fixture_id,embed_url,updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);
    if (error) {
      host.textContent = `تعذّر تحميل المشغّلات: ${error.message}. شغّل ترحيل قاعدة البيانات الموضح في README.`;
      return;
    }

    host.innerHTML = (data || []).map((stream) => `<article class="admin-list-item">
      <div><strong>رقم المباراة: ${escapeHtml(stream.fixture_id)}</strong><small>مشغّل رسمي مضاف</small></div>
      <div class="row">
        <button type="button" class="btn outline" data-edit-stream="${escapeHtml(stream.fixture_id)}">تعديل</button>
        <button type="button" class="btn outline" data-delete-stream="${escapeHtml(stream.fixture_id)}">حذف</button>
      </div>
    </article>`).join('') || '<p class="note">لم تتم إضافة مشغّلات بعد.</p>';

    host.querySelectorAll('[data-edit-stream]').forEach((button) => {
      button.addEventListener('click', () => {
        const stream = data.find((item) => item.fixture_id === Number(button.dataset.editStream));
        if (!stream) return;
        $('stream-edit-id').value = stream.fixture_id;
        if (![...$('stream-fixture-id').options].some((option) => Number(option.value) === stream.fixture_id)) {
          const option = document.createElement('option');
          option.value = String(stream.fixture_id);
          option.textContent = `المباراة #${stream.fixture_id} (غير موجودة ضمن قائمة الأيام الحالية)`;
          $('stream-fixture-id').append(option);
        }
        $('stream-fixture-id').value = stream.fixture_id;
        $('stream-embed-url').value = stream.embed_url;
        $('stream-save').textContent = 'حفظ التعديلات';
        $('stream-cancel-edit').hidden = false;
        $('stream-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    host.querySelectorAll('[data-delete-stream]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!window.confirm('هل تريد إزالة المشغّل من هذه المباراة؟')) return;
        const { error: deleteError } = await client
          .from('fixture_streams')
          .delete()
          .eq('fixture_id', Number(button.dataset.deleteStream));
        say('stream-message', deleteError ? `تعذّر حذف المشغّل: ${deleteError.message}` : 'تم حذف المشغّل.');
        if (!deleteError) await loadStreams();
      });
    });
  }

  $('product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser) return;
    say('product-message', 'جارٍ حفظ المنتج...');
    const row = {
      name: $('product-name').value.trim(),
      description: $('product-description').value.trim(),
      price: $('product-price').value === '' ? null : Number($('product-price').value),
      image_url: $('product-image').value.trim(),
      buy_url: $('product-buy').value.trim(),
      is_published: $('product-published').checked,
    };
    const { error } = await client.from('products').insert(row);
    if (error) {
      say('product-message', `تعذّر حفظ المنتج: ${error.message}`);
      return;
    }
    event.currentTarget.reset();
    $('product-published').checked = true;
    say('product-message', 'تمت إضافة المنتج.');
    await loadProducts();
  });

  async function loadProducts() {
    const host = $('admin-products');
    const { data, error } = await client
      .from('products')
      .select('id,name,is_published')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      host.textContent = `تعذّر تحميل المنتجات: ${error.message}`;
      return;
    }
    host.innerHTML = (data || []).map((product) => `<article class="admin-list-item">
      <div><strong>${escapeHtml(product.name)}</strong><small>${product.is_published ? 'جاهز للنشر' : 'مخفي'}</small></div>
      <button type="button" class="btn outline" data-delete-product="${escapeHtml(product.id)}">حذف</button>
    </article>`).join('') || '<p class="note">لا توجد منتجات.</p>';

    host.querySelectorAll('[data-delete-product]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!window.confirm('هل تريد حذف هذا المنتج؟')) return;
        const { error: deleteError } = await client.from('products').delete().eq('id', button.dataset.deleteProduct);
        say('product-message', deleteError ? `تعذّر حذف المنتج: ${deleteError.message}` : 'تم حذف المنتج.');
        if (!deleteError) await loadProducts();
      });
    });
  }

  checkSession();
})();
