import { apiFetch } from './config';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

/** يرسل الرسالة إلى الخادم (POST /api/contact). يفشل بوضوح إن لم يكن الخادم متاحًا. */
export async function sendContact(payload: ContactPayload): Promise<void> {
  await apiFetch<{ ok: boolean }>('/contact', { method: 'POST', body: JSON.stringify(payload) });
}
