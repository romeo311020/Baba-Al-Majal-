(() => {
  const ready = window.YR_SUPABASE_URL && window.YR_SUPABASE_PUBLISHABLE_KEY &&
    !window.YR_SUPABASE_URL.includes('PASTE_') && !window.YR_SUPABASE_PUBLISHABLE_KEY.includes('PASTE_');
  window.yrSupabaseReady = Boolean(ready && window.supabase?.createClient);
  window.yrSupabase = window.yrSupabaseReady
    ? window.supabase.createClient(window.YR_SUPABASE_URL, window.YR_SUPABASE_PUBLISHABLE_KEY)
    : null;
})();
