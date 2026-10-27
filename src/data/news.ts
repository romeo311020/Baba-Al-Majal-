import type { NewsArticle } from '../types';

/**
 * ⚠️ أخبار تجريبية. نصوص أصلية كتبها فريق المشروع لعرض التصميم:
 * بعضها تقارير عن مباريات تجريبية، وبعضها شروحات عامة للقوانين.
 * لا تُنسخ مقالات من مواقع أخرى. للأخبار الحقيقية اربط مصدرًا مرخصًا أو لوحة إدارة.
 */
const SOURCE = 'Yalla Riyada Demo Desk';

export const NEWS: NewsArticle[] = [
  {
    id: 'n-1',
    sport: 'football',
    title: {
      ar: 'نسور النيل تتغلب على دلتا يونايتد 2-1 في مباراة تجريبية مثيرة',
      en: 'Nile Eagles edge Delta United 2-1 in a demo thriller',
    },
    summary: {
      ar: 'تقرير تجريبي يوضح شكل خبر المباراة: الملخص والنتيجة وأبرز اللحظات.',
      en: 'A demo report showing how a match story looks: summary, result and key moments.',
    },
    body: [
      {
        ar: 'هذا تقرير تجريبي لمباراة خيالية بين نسور النيل ودلتا يونايتد. الهدف منه اختبار تنسيق الخبر على الجوال والكمبيوتر، وليس نقل نتيجة حقيقية.',
        en: 'This is a demo report for a fictional match between Nile Eagles and Delta United. Its purpose is to test article layout on phone and desktop, not to report a real result.',
      },
      {
        ar: 'عند ربط مصدر أخبار مرخص سيحل نص الخبر الحقيقي مكان هذه الفقرات، مع صورة ومصدر وتاريخ نشر حقيقي.',
        en: 'Once a licensed news source is connected, real article text will replace these paragraphs, along with a real image, source and publishing date.',
      },
    ],
    daysAgo: 1,
    hour: 22,
    source: SOURCE,
    views: 4210,
    teamIds: ['t-nile', 't-delta'],
  },
  {
    id: 'n-2',
    sport: 'football',
    title: {
      ar: 'كيف تقرأ جدول الدوري؟ دليل مبسّط',
      en: 'How to read a league table: a simple guide',
    },
    summary: {
      ar: 'من النقاط إلى فارق الأهداف: ما معنى كل عمود في ترتيب الدوري ولماذا يهم.',
      en: 'From points to goal difference: what each column in a league table means and why it matters.',
    },
    body: [
      {
        ar: 'جدول الدوري يلخّص أداء الفرق: عدد المباريات، والفوز والتعادل والخسارة، والأهداف لها وعليها، ثم النقاط. في معظم الدوريات يمنح الفوز ثلاث نقاط والتعادل نقطة والخسارة صفرًا.',
        en: 'A league table summarises team performance: matches played, wins, draws and losses, goals for and against, then points. In most leagues a win earns three points, a draw one and a defeat none.',
      },
      {
        ar: 'عند تساوي النقاط تُستخدم معايير فض التعادل التي تحددها لائحة كل بطولة، مثل فارق الأهداف أو المواجهات المباشرة. لذلك اقرأ لائحة البطولة قبل استنتاج الترتيب النهائي.',
        en: 'When teams are level on points, each competition applies its own tie-break rules, such as goal difference or head-to-head results. Check the competition rules before concluding the final order.',
      },
    ],
    daysAgo: 2,
    hour: 10,
    source: SOURCE,
    views: 3120,
  },
  {
    id: 'n-3',
    sport: 'basketball',
    title: {
      ar: 'دانكرز جدة يخطفون الفوز 91-88 في ليلة سلة تجريبية',
      en: 'Jeddah Dunkers snatch it 91-88 in a demo basketball night',
    },
    summary: {
      ar: 'مثال على تقرير مباراة سلة: فارق صغير ونهاية مشتعلة.',
      en: 'A sample basketball report: a tiny margin and a tense finish.',
    },
    body: [
      {
        ar: 'تقرير تجريبي عن لقاء خيالي بين كايرو هوبس ودانكرز جدة. الأرقام والأسماء هنا لعرض التصميم فقط.',
        en: 'A demo report on a fictional game between Cairo Hoops and Jeddah Dunkers. Numbers and names are for layout display only.',
      },
      {
        ar: 'في النسخة الحقيقية يمكن أن تضم الصفحة إحصائيات الأرباع وأفضل المسجلين وروابط لتفاصيل المباراة.',
        en: 'In the real version the page can include quarter stats, top scorers and links to the match details.',
      },
    ],
    daysAgo: 1,
    hour: 23,
    source: SOURCE,
    views: 1890,
    teamIds: ['t-bb-cairo', 't-bb-jeddah'],
  },
  {
    id: 'n-4',
    sport: 'tennis',
    title: {
      ar: 'نظام احتساب النقاط في التنس: من «الصفر» إلى التاي بريك',
      en: 'Tennis scoring explained: from love to the tiebreak',
    },
    summary: {
      ar: 'شرح سريع للنقاط والأشواط والمجموعات وكيف تُحسم المجموعة المتعادلة.',
      en: 'A quick walkthrough of points, games and sets, and how a level set gets decided.',
    },
    body: [
      {
        ar: 'تُحتسب نقاط الشوط بالتسلسل: صفر، ثم 15، ثم 30، ثم 40، ثم الشوط. إذا تعادل اللاعبان عند 40 يلزم التقدم بنقطتين لحسم الشوط.',
        en: 'Points within a game run: love, 15, 30, 40, then game. If both players reach 40, one must win by two clear points.',
      },
      {
        ar: 'تُحسم المجموعة عادةً بالفوز بستة أشواط مع فارق شوطين، وعند التعادل في الأشواط تُستخدم قاعدة التاي بريك وفق لائحة البطولة.',
        en: 'A set is usually won by taking six games with a two-game margin; if games are level, a tiebreak is applied according to the tournament rules.',
      },
    ],
    daysAgo: 3,
    hour: 9,
    source: SOURCE,
    views: 2640,
  },
  {
    id: 'n-5',
    sport: 'handball',
    title: {
      ar: 'كرة اليد في خمس دقائق: أهم القوانين',
      en: 'Handball in five minutes: the key rules',
    },
    summary: {
      ar: 'عدد اللاعبين والخطوات ومنطقة المرمى والإيقاف لدقيقتين.',
      en: 'Players, steps, the goal area and two-minute suspensions.',
    },
    body: [
      {
        ar: 'يلعب كل فريق بسبعة لاعبين داخل الملعب بينهم الحارس. المباراة شوطان مدة كل منهما ثلاثون دقيقة في الفئات الكبرى. يمكن للاعب الإمساك بالكرة ثلاث ثوانٍ وأخذ ثلاث خطوات قبل التمرير أو التسديد أو الدحرجة.',
        en: 'Each team fields seven players on court including the goalkeeper. Senior matches are two halves of thirty minutes. A player may hold the ball for three seconds and take three steps before passing, shooting or dribbling.',
      },
      {
        ar: 'لا يُسمح لغير الحارس بدخول منطقة المرمى، وقد يؤدي التدخل العنيف إلى إيقاف اللاعب دقيقتين. تُنفَّذ رمية السبعة أمتار عند إفساد فرصة تسجيل واضحة.',
        en: 'Only the goalkeeper may enter the goal area, and rough play can lead to a two-minute suspension. A seven-metre throw is awarded when a clear scoring chance is illegally prevented.',
      },
    ],
    daysAgo: 4,
    hour: 12,
    source: SOURCE,
    views: 1560,
  },
  {
    id: 'n-6',
    sport: 'volleyball',
    title: {
      ar: 'التدوير في الكرة الطائرة: لماذا يتحرك اللاعبون بعد كل إرسال؟',
      en: 'Volleyball rotation: why players move after each serve',
    },
    summary: {
      ar: 'قاعدة التدوير بكلمات بسيطة، ولماذا تضمن مشاركة الجميع في الإرسال.',
      en: 'The rotation rule in plain words, and why it makes everyone take a turn serving.',
    },
    body: [
      {
        ar: 'يلعب كل فريق بستة لاعبين. عندما يكسب الفريق نقطة بعد أن كان الإرسال مع الخصم، يدور اللاعبون خطوة واحدة في اتجاه عقارب الساعة ثم يرسل اللاعب الجديد في موضع الإرسال.',
        en: 'Each team plays six players. When a team wins the rally after the opponent served, its players rotate one position clockwise and the new player in the serving spot serves.',
      },
      {
        ar: 'تُلعب المجموعات حتى 25 نقطة بفارق نقطتين، والمجموعة الخامسة الحاسمة حتى 15 نقطة بنفس شرط الفارق.',
        en: 'Sets go to 25 points with a two-point margin, and a deciding fifth set goes to 15 with the same margin.',
      },
    ],
    daysAgo: 5,
    hour: 11,
    source: SOURCE,
    views: 980,
  },
  {
    id: 'n-7',
    sport: 'athletics',
    title: {
      ar: 'خطة مبتدئين لسباق 10 كم: ابدأ بهدوء وتقدّم تدريجيًا',
      en: 'A beginner plan for a 10K: start easy, build gradually',
    },
    summary: {
      ar: 'مبادئ عامة للتدرّج والراحة والإحماء. معلومات عامة وليست نصيحة طبية.',
      en: 'General principles on progression, rest and warm-ups. General information, not medical advice.',
    },
    body: [
      {
        ar: 'ابدأ بجلسات جري خفيف تتخللها فترات مشي، وزد المسافة والمدة تدريجيًا من أسبوع لآخر. خصّص يومًا أو يومين للراحة أسبوعيًا ليتكيّف الجسم.',
        en: 'Begin with easy runs mixed with walking breaks, and increase distance and time gradually from week to week. Keep one or two rest days weekly so the body can adapt.',
      },
      {
        ar: 'احرص على الإحماء قبل الجري والإطالة الخفيفة بعده، وارتدِ حذاءً مناسبًا. إذا شعرت بألم مستمر أو كانت لديك حالة صحية فاستشر مختصًا قبل الاستمرار.',
        en: 'Warm up before running, stretch lightly afterwards and wear suitable shoes. If pain persists or you have a health condition, consult a professional before continuing.',
      },
    ],
    daysAgo: 6,
    hour: 8,
    source: SOURCE,
    views: 2210,
  },
  {
    id: 'n-8',
    sport: 'swimming',
    title: {
      ar: 'معاينة الملتقى التجريبي: أكوا الإسكندرية في مواجهة أكوا الدمام',
      en: 'Demo meet preview: Alex Aqua Club vs Dammam Aqua Club',
    },
    summary: {
      ar: 'مثال على صفحة معاينة حدث رياضي قادم.',
      en: 'A sample preview page for an upcoming sporting event.',
    },
    body: [
      {
        ar: 'معاينة خيالية لملتقى سباحة بين ناديين تجريبيين. تُستخدم لعرض شكل المحتوى المرتبط بحدث قادم.',
        en: 'A fictional preview of a swimming meet between two demo clubs. It shows how content around an upcoming event looks.',
      },
      {
        ar: 'عند توفر بيانات حقيقية يمكن إضافة قائمة السباقات والأزمنة السابقة والمشاركين.',
        en: 'With real data you can add the race list, previous times and entrants.',
      },
    ],
    daysAgo: 0,
    hour: 7,
    source: SOURCE,
    views: 640,
    teamIds: ['t-sw-alex', 't-sw-dammam'],
  },
  {
    id: 'n-9',
    sport: 'boxing',
    title: {
      ar: 'كيف تُحتسب النقاط في الملاكمة؟ نظام الـ10 نقاط',
      en: 'How boxing is scored: the 10-point must system',
    },
    summary: {
      ar: 'الحكام يمنحون الفائز في الجولة 10 نقاط والخاسر 9 أو أقل. وماذا يعني الإسقاط؟',
      en: 'Judges give the round winner 10 points and the loser 9 or fewer. What does a knockdown change?',
    },
    body: [
      {
        ar: 'في نظام النقاط العشر يمنح كل حكم الفائز في الجولة عشر نقاط، ويمنح الخاسر تسعًا في الغالب. وإذا حدث إسقاط يخسر الملاكم المُسقَط نقطة إضافية في تلك الجولة.',
        en: 'Under the 10-point must system each judge gives the round winner ten points and usually nine to the loser. A knockdown typically costs the fallen boxer an extra point in that round.',
      },
      {
        ar: 'تُجمع نقاط الجولات في بطاقة كل حكم، ويُعلَن الفائز بقرار الأغلبية أو الإجماع إذا لم ينتهِ النزال قبل الوقت.',
        en: 'Round scores are added on each judge’s card, and the winner is announced by majority or unanimous decision if the bout does not end early.',
      },
    ],
    daysAgo: 7,
    hour: 15,
    source: SOURCE,
    views: 1330,
  },
  {
    id: 'n-10',
    sport: 'football',
    title: {
      ar: 'قانون التسلل بكلمات بسيطة',
      en: 'The offside law in plain words',
    },
    summary: {
      ar: 'متى يكون اللاعب في وضع تسلل؟ ومتى تُحتسب المخالفة؟ وما الحالات المستثناة؟',
      en: 'When is a player in an offside position? When is it an offence? And what are the exceptions?',
    },
    body: [
      {
        ar: 'يكون اللاعب في موقف تسلل إذا كان أي جزء من رأسه أو جسده أو قدميه في نصف ملعب الخصم، وأقرب إلى خط مرمى الخصم من الكرة ومن ثاني آخر مدافع.',
        en: 'A player is in an offside position if any part of the head, body or feet is in the opponents’ half and nearer to the opponents’ goal line than both the ball and the second-last opponent.',
      },
      {
        ar: 'لا تُحتسب المخالفة بمجرد الوجود في هذا الموقف؛ يجب أن يشارك اللاعب في اللعب. ولا يوجد تسلل مباشرة من ركلة مرمى أو رمية تماس أو ركلة ركنية.',
        en: 'Being in that position is not itself an offence; the player must become involved in play. There is no offside directly from a goal kick, throw-in or corner kick.',
      },
    ],
    daysAgo: 8,
    hour: 13,
    source: SOURCE,
    views: 5100,
  },
];

export function getNewsById(id: string): NewsArticle | undefined {
  return NEWS.find((n) => n.id === id);
}
