import type { Lang } from '../types';
import { ApiError, apiFetch } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * live         = ردّ حقيقي من نموذج الذكاء الاصطناعي عبر الخادم
 * demo-server  = الخادم يعمل لكن مفتاح الذكاء الاصطناعي غير مضبوط (ردّ تجريبي)
 * offline-demo = لا يوجد خادم (استضافة ثابتة) — ردّ تجريبي محلي
 */
export type AiMode = 'live' | 'demo-server' | 'offline-demo';

export interface ChatResult {
  reply: string;
  mode: AiMode;
}

interface ServerChatResponse {
  reply: string;
  demo: boolean;
}

interface ServerHealth {
  ok: boolean;
  aiConfigured: boolean;
}

export async function getAiMode(): Promise<AiMode> {
  try {
    const h = await apiFetch<ServerHealth>('/health', {}, 6000);
    return h.aiConfigured ? 'live' : 'demo-server';
  } catch {
    return 'offline-demo';
  }
}

const OFFLINE_REPLY: Record<Lang, string> = {
  ar: 'هذا ردّ تجريبي محلي: لا يوجد خادم متصل حاليًا، لذلك لا يعمل الذكاء الاصطناعي الحقيقي. شغّل الخادم (npm run server) وأضف AI_API_KEY في ملف .env لتفعيل Yalla AI.',
  en: 'This is a local demo reply: no server is connected, so the real AI is not running. Start the server (npm run server) and set AI_API_KEY in your .env file to enable Yalla AI.',
};

export async function sendChat(messages: ChatMessage[], lang: Lang): Promise<ChatResult> {
  try {
    const res = await apiFetch<ServerChatResponse>(
      '/chat',
      { method: 'POST', body: JSON.stringify({ messages, lang }) },
      60000,
    );
    return { reply: res.reply, mode: res.demo ? 'demo-server' : 'live' };
  } catch (e) {
    if (e instanceof ApiError && e.network) {
      return { reply: OFFLINE_REPLY[lang], mode: 'offline-demo' };
    }
    throw e;
  }
}
