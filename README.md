# يلا رياضة — نسخة تطويرية

موقع ثابت HTML/CSS/JS، بدون Node.js أو Git محلي. ارفع الملفات كلها إلى جذر مستودع GitHub Pages مع مجلد assets.

## صفحات المشروع
الرئيسية، المباريات، تفاصيل المباراة، الأخبار، المساعد AI التجريبي مع سجل محادثات محلي، المتجر، تفاصيل المنتج، حسابي، لوحة التحكم، عن المنصة.

## مهم جدًا قبل النشر العام
- المواعيد والنتائج تجريبية وليست بيانات حقيقية مباشرة. لبيانات حقيقية نحتاج مزود API رياضي وخادمًا وسيطًا يخفي المفتاح.
- لا يوجد بث مباريات مضمن؛ صفحة المباراة تعرض مكانًا لتفاصيل التشكيلة والإحصائيات، وتحتاج بيانات API وروابط قانونية/رسمية.
- المساعد الحالي ليس AI حقيقيًا، ويستخدم ردودًا محدودة. سجل المحادثات محفوظ في localStorage على الجهاز الحالي فقط.
- حساب المستخدم ولوحة التحكم تجريبيان ومحليان وغير آمنين. لا تستخدمهما لحسابات حقيقية. يلزم Supabase Auth أو backend موثوق مع صلاحيات على الخادم وقواعد بيانات.
- لوحة التحكم تحفظ الإعدادات التجريبية في المتصفح ولا تغيّر محتوى الموقع المنشور للزوار.
- المتجر لا يعالج المدفوعات؛ بيانات المنتجات أمثلة.

## النشر عبر المتصفح
1. فك ضغط ZIP. 2. افتح المستودع على GitHub. 3. Add file → Upload files. 4. ارفع كل محتويات المجلد (بما فيها assets) إلى جذر المستودع. 5. Commit changes. 6. من Settings → Pages اختر Deploy from a branch، الفرع main والمجلد /(root).

## المطور
Romany Garges — https://romeo311020.github.io/Romany-Profile/


## V3 — Supabase integration starter

This package adds a real Supabase Auth flow, protected admin panel, database schema, match + product management, and public match/store reads. It is not fully live until the setup below is completed.

### Setup from GitHub + Supabase dashboard (no local Node/Git required)
1. In Supabase, open SQL Editor and run the full `supabase-setup.sql` file.
2. In Supabase Settings → API Keys, copy the Project URL and the **Publishable key** (safe for browser use with correct RLS). Do not use a Secret/service_role key.
3. Edit `supabase-config.js` in GitHub and replace the two `PASTE_...` placeholders. Commit changes.
4. Open `account.html` on your published site and create your account using the email you intend to use as admin. Confirm the email if the project requires it.
5. In Supabase SQL Editor run: `update public.profiles set role = 'admin' where email = 'YOUR_ADMIN_EMAIL';` replacing the example with your exact account email. Do not share passwords or secret keys.
6. Open `admin.html`, sign in, add a test match, optionally add an official embed URL, and save. Check `matches.html` and the match details page. Add a product and check `store.html`.
7. For iframe playback, the source website must allow embedding. A normal webpage URL may refuse iframe loading; use the provider's official embed URL and follow its terms.

### Sports API
The initial package deliberately does not place a sports API key in browser JavaScript. Choose a provider and check which leagues its free tier includes. For a first low-cost test, API-Football advertises a free tier with limited leagues and request limits; availability can change. See https://www.apifootball.com/ . To add this API safely, use a Supabase Edge Function with the provider key stored as a server-side secret; never paste the provider key into `app.js` or `supabase-config.js`.

### Security notes
- Supabase publishable keys are intended for browser use; the database must be protected by RLS. Never expose a Secret/service_role key.
- Admin access depends on the `profiles.role` row, protected by RLS. The signup flow never lets users choose their own role.
- This first milestone writes matches/products to Supabase. Existing demo news, AI responses, and chat history are not yet connected to a live AI service or database.
- Do not use the site to distribute streams unless you have permission to embed and display them.
