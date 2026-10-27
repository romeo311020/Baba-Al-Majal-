/** مسار ملف داخل public/ يعمل مع أي base (استضافة ثابتة أو مجلد فرعي) */
export const asset = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
