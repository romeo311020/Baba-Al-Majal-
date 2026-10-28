(() => {
  'use strict';

  const db = window.yrSupabase;
  const form = document.getElementById('password-reset-form');
  const message = document.getElementById('password-reset-message');
  const submit = document.getElementById('reset-password-submit');
  let hasRecoverySession = false;
  const showMessage = (text, isError = false) => {
    message.textContent = text;
    message.classList.toggle('account-message-error', isError);
  };

  if (!db) {
    submit.disabled = true;
    showMessage('خدمة الحساب غير مفعّلة بعد. أضف إعدادات Supabase أولًا.', true);
    return;
  }

  submit.disabled = true;
  db.auth.getSession().then(({ data, error }) => {
    if (error) showMessage(`تعذّر التحقق من رابط الاستعادة: ${error.message}`, true);
    else if (data.session) {
      hasRecoverySession = true;
      submit.disabled = false;
    } else {
      showMessage('رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة حسابي.', true);
    }
  }).catch((error) => {
    showMessage(`تعذّر التحقق من رابط الاستعادة: ${error.message}`, true);
  });
  db.auth.onAuthStateChange((_event, session) => {
    hasRecoverySession = Boolean(session);
    submit.disabled = !hasRecoverySession;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!hasRecoverySession) {
      showMessage('رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة حسابي.', true);
      return;
    }

    const newPassword = document.getElementById('reset-password').value;
    if (newPassword !== document.getElementById('reset-password-confirm').value) {
      showMessage('كلمتا المرور غير متطابقتين.', true);
      document.getElementById('reset-password-confirm').focus();
      return;
    }

    submit.disabled = true;
    showMessage('جارٍ تحديث كلمة المرور...');
    try {
      const { error } = await db.auth.updateUser({ password: newPassword });
      if (error) throw error;
      form.reset();
      showMessage('تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول بكلمتك الجديدة.');
      document.getElementById('password-reset-back').textContent = 'الذهاب إلى حسابي';
    } catch (error) {
      showMessage(`تعذّر تحديث كلمة المرور: ${error.message}`, true);
    } finally {
      submit.disabled = false;
    }
  });
})();
