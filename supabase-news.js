(() => {
  'use strict';

  const db = window.yrSupabase;
  const host = document.getElementById('news-list');
  if (!host) return;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const safeHttpsUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };
  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
      ? date.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })
      : 'تاريخ النشر غير متاح';
  };

  async function loadNews() {
    if (!db) {
      host.innerHTML = '<p class="note">إعدادات Supabase غير مكتملة. لا يمكن تحميل الأخبار حاليًا.</p>';
      return;
    }

    host.setAttribute('aria-busy', 'true');
    host.innerHTML = '<p class="note">جارٍ تحميل آخر الأخبار الرياضية...</p>';
    try {
      const { data, error } = await db.functions.invoke('sports-news', { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const articles = (Array.isArray(data?.articles) ? data.articles : [])
        .map((article) => ({ ...article, safeUrl: safeHttpsUrl(article.url), safeImage: safeHttpsUrl(article.image) }))
        .filter((article) => article.safeUrl);

      host.innerHTML = articles.map((article) => `<article class="news-card">
        ${article.safeImage ? `<a class="news-card-image" href="${escapeHtml(article.safeUrl)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(article.safeImage)}" alt="" loading="lazy"></a>` : ''}
        <div class="news-card-content">
          <div class="news-meta"><span class="tag">${escapeHtml(article.source)}</span><time>${escapeHtml(formatDate(article.publishedAt))}</time></div>
          <h2><a href="${escapeHtml(article.safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a></h2>
          ${article.description ? `<p>${escapeHtml(article.description)}</p>` : ''}
          <a class="news-read-more" href="${escapeHtml(article.safeUrl)}" target="_blank" rel="noopener noreferrer">اقرأ الخبر من المصدر ↗</a>
        </div>
      </article>`).join('') || '<p class="note">لا توجد أخبار رياضية عربية متاحة حاليًا.</p>';
    } catch (error) {
      console.error('Could not load sports news:', error);
      host.innerHTML = `<p class="note">تعذّر تحميل الأخبار: ${escapeHtml(error.message || 'خطأ غير معروف')}. حاول مرة أخرى لاحقًا.</p>`;
    } finally {
      host.removeAttribute('aria-busy');
    }
  }

  loadNews();
})();
