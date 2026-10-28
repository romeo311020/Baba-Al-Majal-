(() => {
  'use strict';

  const db = window.yrSupabase;
  const $ = (id) => document.getElementById(id);
  const authPanel = $('account-auth');
  const dashboard = $('account-dashboard');
  const loginForm = $('account-form');
  const message = $('account-message');
  const tabs = [$('signin-tab'), $('signup-tab')];
  const nameField = $('name-field');
  const confirmField = $('confirm-field');
  const password = $('password');
  const submit = $('account-submit');
  const googleButton = $('google-signin');
  let mode = 'signin';

  const setMessage = (element, text, isError = false) => {
    element.textContent = text;
    element.classList.toggle('account-message-error', isError);
  };

  const setBusy = (busy, buttons = [submit, googleButton, ...tabs, $('forgot-password')]) => {
    buttons.forEach((button) => { button.disabled = busy; });
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
    $('forgot-password').hidden = signingUp;
    tabs.forEach((tab, index) => {
      const active = (index === 0 && !signingUp) || (index === 1 && signingUp);
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    setMessage(message, '');
  };

  tabs[0].addEventListener('click', () => setMode('signin'));
  tabs[1].addEventListener('click', () => setMode('signup'));

  if (!db) {
    setMessage(message, 'خدمة الحساب غير مفعّلة بعد. أضف بيانات مشروع Supabase في ملف الإعدادات.', true);
    setBusy(true);
    $('profile-save').disabled = true;
    $('password-save').disabled = true;
    return;
  }

  const showUser = (user) => {
    const isSignedIn = Boolean(user);
    authPanel.hidden = isSignedIn;
    dashboard.hidden = !isSignedIn;
    if (!user) return;

    $('profile-name').value = user.user_metadata?.full_name || user.user_metadata?.name || '';
    $('profile-email').value = user.email || '';
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const email = $('email').value.trim();
    const currentPassword = password.value;
    if (mode === 'signup' && currentPassword !== $('confirm-password').value) {
      setMessage(message, 'كلمتا المرور غير متطابقتين.', true);
      $('confirm-password').focus();
      return;
    }

    setBusy(true);
    setMessage(message, mode === 'signup' ? 'جارٍ إنشاء حسابك...' : 'جارٍ تسجيل الدخول...');
    try {
      const result = mode === 'signup'
        ? await db.auth.signUp({
          email,
          password: currentPassword,
          options: { data: { full_name: $('full-name').value.trim() } },
        })
        : await db.auth.signInWithPassword({ email, password: currentPassword });

      if (result.error) {
        setMessage(message, `تعذّر ${mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'}: ${result.error.message}`, true);
      } else if (mode === 'signup' && !result.data.session) {
        setMessage(message, 'تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده قبل تسجيل الدخول.');
      } else {
        setMessage(message, mode === 'signup' ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح.' : 'تم تسجيل الدخول بنجاح.');
        showUser(result.data.user);
      }
    } catch (error) {
      setMessage(message, `تعذّرت العملية بسبب مشكلة في الاتصال: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  });

  $('forgot-password').addEventListener('click', async () => {
    if (!$('email').reportValidity()) {
      $('email').focus();
      return;
    }
    setBusy(true);
    setMessage(message, 'جارٍ إرسال رابط استعادة كلمة المرور...');
    try {
      const redirectTo = new URL('password-reset.html', window.location.href).href;
      const { error } = await db.auth.resetPasswordForEmail($('email').value.trim(), { redirectTo });
      if (error) throw error;
      setMessage(message, 'إذا كان البريد مسجلًا، ستصلك رسالة فيها رابط آمن لتعيين كلمة مرور جديدة.');
    } catch (error) {
      setMessage(message, `تعذّر إرسال رابط الاستعادة: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  });

  googleButton.addEventListener('click', async () => {
    setBusy(true);
    setMessage(message, 'جارٍ تحويلك إلى Google...');
    try {
      const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href.split(/[?#]/)[0] },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(message, `تعذّر تسجيل الدخول باستخدام Google: ${error.message}`, true);
      setBusy(false);
    }
  });

  $('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const saveButton = $('profile-save');
    const previousEmail = $('profile-email').value.trim();
    const profileName = $('profile-name').value.trim();
    setBusy(true, [saveButton]);
    setMessage($('profile-message'), 'جارٍ حفظ بياناتك...');
    try {
      const { data: currentUserData, error: currentUserError } = await db.auth.getUser();
      if (currentUserError) throw currentUserError;
      const currentEmail = currentUserData.user?.email || '';
      const emailChangeRequested = previousEmail.toLowerCase() !== currentEmail.toLowerCase();
      const updates = { data: { full_name: profileName } };
      if (emailChangeRequested) updates.email = previousEmail;
      const { data, error } = await db.auth.updateUser(updates);
      if (error) throw error;
      const emailChangePending = emailChangeRequested
        && data.user.email.toLowerCase() !== previousEmail.toLowerCase();
      showUser(data.user);
      setMessage(
        $('profile-message'),
        emailChangePending
          ? 'تم تحديث الاسم. أرسلنا رسالة تأكيد إلى البريد الجديد؛ سيظل بريدك الحالي مستخدمًا حتى تأكيده.'
          : 'تم حفظ بيانات حسابك.',
      );
    } catch (error) {
      setMessage($('profile-message'), `تعذّر حفظ البيانات: ${error.message}`, true);
    } finally {
      setBusy(false, [saveButton]);
    }
  });

  $('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if ($('new-password').value !== $('confirm-new-password').value) {
      setMessage($('password-message'), 'كلمتا المرور غير متطابقتين.', true);
      $('confirm-new-password').focus();
      return;
    }

    const saveButton = $('password-save');
    setBusy(true, [saveButton]);
    setMessage($('password-message'), 'جارٍ تحديث كلمة المرور...');
    try {
      const { error } = await db.auth.updateUser({ password: $('new-password').value });
      if (error) throw error;
      event.currentTarget.reset();
      setMessage($('password-message'), 'تم تحديث كلمة المرور بنجاح.');
    } catch (error) {
      setMessage($('password-message'), `تعذّر تحديث كلمة المرور: ${error.message}`, true);
    } finally {
      setBusy(false, [saveButton]);
    }
  });

  $('logout').addEventListener('click', async () => {
    const button = $('logout');
    setBusy(true, [button]);
    try {
      const { error } = await db.auth.signOut();
      if (error) throw error;
      showUser(null);
      setMessage(message, 'تم تسجيل الخروج.');
    } catch (error) {
      setMessage($('profile-message'), `تعذّر تسجيل الخروج: ${error.message}`, true);
    } finally {
      setBusy(false, [button]);
    }
  });

  db.auth.getSession().then(({ data, error }) => {
    if (error) setMessage(message, `تعذّر التحقق من حالة الحساب: ${error.message}`, true);
    showUser(data?.session?.user || null);
  }).catch((error) => {
    setMessage(message, `تعذّر التحقق من حالة الحساب: ${error.message}`, true);
  });

  db.auth.onAuthStateChange((_event, session) => showUser(session?.user || null));
})();
