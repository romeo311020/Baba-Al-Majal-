import type { Product, Vendor } from '../types';

/**
 * ⚠️ منتجات وأسعار تجريبية بالكامل. العلامات التجارية خيالية، وبلا روابط شراء (buyUrl: null).
 * عند ربط بائع حقيقي: ضع buyUrl الفعلي، وسيُلحق affiliateTag تلقائيًا (انظر services/storeApi.ts).
 * لا يوجد دفع إلكتروني في هذا المشروع.
 */
export const VENDORS: Vendor[] = [
  { id: 'v-demo-1', name: 'Demo Vendor One' },
  { id: 'v-demo-2', name: 'Demo Vendor Two' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'pr-1',
    name: { ar: 'كرة مباريات احترافية', en: 'Pro Match Football' },
    brand: 'Velox',
    category: 'balls',
    sport: 'football',
    price: 29,
    currency: 'USD',
    description: {
      ar: 'كرة قدم تجريبية بمقاس 5 لعرض تصميم صفحة المنتج.',
      en: 'A demo size-5 football to preview the product page design.',
    },
    features: [
      { ar: 'مقاس 5', en: 'Size 5' },
      { ar: 'سطح مقاوم للاحتكاك', en: 'Abrasion-resistant surface' },
      { ar: 'مناسبة للعشب الطبيعي والصناعي', en: 'Suited to natural and artificial turf' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-2',
    name: { ar: 'حذاء ملاعب السلة «كورت رانر»', en: 'Court Runner Basketball Shoes' },
    brand: 'Atlas Sport',
    category: 'shoes',
    sport: 'basketball',
    price: 89,
    currency: 'USD',
    description: {
      ar: 'حذاء سلة تجريبي بنعل ثابت وتبطين مريح.',
      en: 'A demo basketball shoe with a stable sole and comfortable cushioning.',
    },
    features: [
      { ar: 'نعل مطاطي', en: 'Rubber outsole' },
      { ar: 'دعم للكاحل', en: 'Ankle support' },
      { ar: 'تهوية جيدة', en: 'Good ventilation' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-3',
    name: { ar: 'قميص تدريب خفيف', en: 'Lightweight Training Tee' },
    brand: 'Pulse',
    category: 'apparel',
    sport: 'multi',
    price: 24,
    currency: 'USD',
    description: {
      ar: 'قميص تدريب تجريبي سريع الجفاف لمختلف الرياضات.',
      en: 'A demo quick-dry training tee for many sports.',
    },
    features: [
      { ar: 'قماش سريع الجفاف', en: 'Quick-dry fabric' },
      { ar: 'قصّة مريحة', en: 'Relaxed fit' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
  {
    id: 'pr-4',
    name: { ar: 'قميص نسور النيل (تجريبي)', en: 'Nile Eagles Home Jersey (demo)' },
    brand: 'Velox',
    category: 'jerseys',
    sport: 'football',
    price: 49,
    currency: 'USD',
    description: {
      ar: 'قميص لفريق خيالي لعرض تصنيف القمصان في المتجر.',
      en: 'A jersey for a fictional team to show the jerseys category in the store.',
    },
    features: [
      { ar: 'قماش خفيف', en: 'Lightweight fabric' },
      { ar: 'شعار مطبوع', en: 'Printed crest' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-5',
    name: { ar: 'طقم أحزمة مقاومة', en: 'Resistance Bands Set' },
    brand: 'Atlas Sport',
    category: 'training',
    sport: 'multi',
    price: 19,
    currency: 'USD',
    description: {
      ar: 'مجموعة أحزمة مطاطية بدرجات مقاومة متعددة للتمارين المنزلية.',
      en: 'A set of elastic bands in several resistance levels for home workouts.',
    },
    features: [
      { ar: 'خمس درجات مقاومة', en: 'Five resistance levels' },
      { ar: 'حقيبة حمل', en: 'Carry pouch' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
  {
    id: 'pr-6',
    name: { ar: 'حقيبة رياضية 40 لترًا', en: '40L Gym Duffel' },
    brand: 'Pulse',
    category: 'bags',
    sport: 'multi',
    price: 35,
    currency: 'USD',
    description: {
      ar: 'حقيبة رياضية تجريبية بجيب منفصل للحذاء.',
      en: 'A demo duffel with a separate shoe compartment.',
    },
    features: [
      { ar: 'جيب للحذاء', en: 'Shoe compartment' },
      { ar: 'حزام قابل للتعديل', en: 'Adjustable strap' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
  {
    id: 'pr-7',
    name: { ar: 'مضرب تنس خفيف', en: 'Lite Tennis Racket' },
    brand: 'Nova Athletics',
    category: 'equipment',
    sport: 'tennis',
    price: 79,
    currency: 'USD',
    description: {
      ar: 'مضرب تنس تجريبي للمبتدئين والمستوى المتوسط.',
      en: 'A demo tennis racket for beginner and intermediate players.',
    },
    features: [
      { ar: 'وزن خفيف', en: 'Light weight' },
      { ar: 'مقبض مريح', en: 'Comfortable grip' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-8',
    name: { ar: 'كرة طائرة للصالات', en: 'Indoor Volleyball' },
    brand: 'Velox',
    category: 'balls',
    sport: 'volleyball',
    price: 34,
    currency: 'USD',
    description: {
      ar: 'كرة طائرة تجريبية للعب داخل الصالات.',
      en: 'A demo volleyball for indoor play.',
    },
    features: [
      { ar: 'ملمس ناعم', en: 'Soft touch' },
      { ar: 'ثبات في الطيران', en: 'Stable flight' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
  {
    id: 'pr-9',
    name: { ar: 'قفازات ملاكمة 12 أونصة', en: '12oz Boxing Gloves' },
    brand: 'Nova Athletics',
    category: 'equipment',
    sport: 'boxing',
    price: 45,
    currency: 'USD',
    description: {
      ar: 'قفازات تجريبية للتدريب على الأكياس والتمرين.',
      en: 'Demo gloves for bag work and training.',
    },
    features: [
      { ar: 'حشو متعدد الطبقات', en: 'Multi-layer padding' },
      { ar: 'إغلاق بشريط لاصق', en: 'Hook-and-loop closure' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-10',
    name: { ar: 'حذاء جري «سترايد»', en: 'Stride Running Shoes' },
    brand: 'Atlas Sport',
    category: 'shoes',
    sport: 'athletics',
    price: 74,
    currency: 'USD',
    description: {
      ar: 'حذاء جري تجريبي خفيف للمسافات المتوسطة.',
      en: 'A demo lightweight running shoe for mid-distance runs.',
    },
    features: [
      { ar: 'وسادة مريحة', en: 'Cushioned midsole' },
      { ar: 'شبكة تهوية', en: 'Breathable mesh' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
  {
    id: 'pr-11',
    name: { ar: 'نظارة سباحة', en: 'Swim Goggles' },
    brand: 'Pulse',
    category: 'equipment',
    sport: 'swimming',
    price: 14,
    currency: 'USD',
    description: {
      ar: 'نظارة سباحة تجريبية مضادة للضباب.',
      en: 'Demo anti-fog swim goggles.',
    },
    features: [
      { ar: 'عدسات مضادة للضباب', en: 'Anti-fog lenses' },
      { ar: 'حزام سيليكون', en: 'Silicone strap' },
    ],
    vendorId: 'v-demo-1',
    buyUrl: null,
  },
  {
    id: 'pr-12',
    name: { ar: 'كرة يد مقاس 3', en: 'Handball Size 3' },
    brand: 'Velox',
    category: 'balls',
    sport: 'handball',
    price: 27,
    currency: 'USD',
    description: {
      ar: 'كرة يد تجريبية بمقاس 3 للفئات الكبرى.',
      en: 'A demo size-3 handball for senior play.',
    },
    features: [
      { ar: 'قبضة جيدة', en: 'Good grip' },
      { ar: 'مقاس 3', en: 'Size 3' },
    ],
    vendorId: 'v-demo-2',
    buyUrl: null,
  },
];

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getVendorById(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}
