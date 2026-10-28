(() => {
  'use strict';

  const db = window.yrSupabase;
  const $ = (id) => document.getElementById(id);
  const form = $('account-form');
  const message = $('account-message');
  const tabs = [$('signin-tab'), $('signup-tab')];
  const nameField = $('name-field');
  const confirmField = $('confirm-field');
  const password = $('password');
  const submit = $('account-submit');
  const googleButton = $('google-signin');
  let mode = 'signin';

  const setMessage = (text, isError = false) => {
    message.textContent = text;
    message.classList.toggle('account-message-error', isError);
  };

  const setBusy = (busy) => {
    [submit, googleButton, ...tabs].forEach((button) => { button.disabled = busy; });
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    const signingUp = mode === 'signup';
    nameField.hidden = !signingUp;
    confirmField.hidden = !signingUp;
    $('full-name').required = signingUp;
    $('confirm-password').required = signingUp;
    password.autocomplete = signingUp ? 'new-password' : 'current-password';
    submit.textContent = signingUp ? 'إنشاء حساب' : 'تسجيل الدخول';
    $('account-heading').textContent = signingUp ? 'أنشئ حسابك وابدأ رحلتك' : 'سجّل دخولك إلى حسابك';
    tabs.forEach((tab, index) => {
      const active = (index === 0 && !signingUp) || (index === 1 && signingUp);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    setMessage('');
  };

  tabs[0].addEventListener('click', () => setMode('signin'));
  tabs[1].addEventListener('click', () => setMode('signup'));

  if (!db) {
    setMessage('خدمة الحساب غير مفعّلة بعد. أضف بيانات مشروع Supabase في ملف الإعدادات.', true);
    submit.disabled = true;
    googleButton.disabled = true;
    return;
  }

  const updateSession = (user) => {
    $('account-session').hidden = !user;
    $('session-email').textContent = user ? (user.email || 'تم تسجيل الدخول') : '';
    document.querySelector('.account-tabs').hidden = Boolean(user);
    form.hidden = Boolean(user);
    document.querySelector('.account-divider').hidden = Boolean(user);
    googleButton.hidden = Boolean(user);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const email = $('email').value.trim();
    const currentPassword = password.value;
    if (mode === 'signup' && currentPassword !== $('confirm-password').value) {
      setMessage('كلمتا المرور غير متطابقتين.', true);
      $('confirm-password').focus();
      return;
    }

    setBusy(true);
    setMessage(mode === 'signup' ? 'جارٍ إنشاء حسابك...' : 'جارٍ تسجيل الدخول...');
    try {
      const result = mode === 'signup'
        ? await db.auth.signUp({
          email,
          password: currentPassword,
          options: { data: { full_name: $('full-name').value.trim() }, emailRedirectTo: window.location.href.split(/[?#]/)[0] },
        })
        : await db.auth.signInWithPassword({ email, password: currentPassword });

      if (result.error) {
        setMessage(`تعذّر ${mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'}: ${result.error.message}`, true);
      } else if (mode === 'signup' && !result.data.session) {
        setMessage('تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده قبل تسجيل الدخول.');
      } else {
        setMessage(mode === 'signup' ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح.' : 'تم تسجيل الدخول بنجاح.');
        updateSession(result.data.user);
      }
    } catch (error) {
      setMessage(`تعذّرت العملية بسبب مشكلة في الاتصال: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  });

  googleButton.addEventListener('click', async () => {
    setBusy(true);
    setMessage('جارٍ تحويلك إلى Google...');
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href.split(/[?#]/)[0] },
      });
      if (error) setMessage(`تعذّر تسجيل الدخول باستخدام Google: ${error.message}`, true);
    } catch (error) {
      setMessage(`تعذّر الاتصال بخدمة Google: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  });

  $('logout').addEventListener('click', async () => {
    setBusy(true);
    try {
      const { error } = await db.auth.signOut();
      if (error) {
        setMessage(`تعذّر تسجيل الخروج: ${error.message}`, true);
        return;
      }
      updateSession(null);
      setMessage('تم تسجيل الخروج.');
    } catch (error) {
      setMessage(`تعذّر تسجيل الخروج بسبب مشكلة في الاتصال: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  });

  db.auth.getSession().then(({ data, error }) => {
    if (error) setMessage(`تعذّر التحقق من حالة الحساب: ${error.message}`, true);
    updateSession(data?.session?.user || null);
  }).catch((error) => {
    setMessage(`تعذّر التحقق من حالة الحساب: ${error.message}`, true);
  });

  db.auth.onAuthStateChange((_event, session) => updateSession(session?.user || null));
})();
