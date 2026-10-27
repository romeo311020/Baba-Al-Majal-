import type { Product, ProductCategory, Result, SportId, Vendor } from '../types';
import { PRODUCTS, getProductById, getVendorById } from '../data/products';
import { DATA_MODE, delay } from './config';

const isDemo = DATA_MODE === 'demo';

export type ProductSort = 'featured' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  q?: string;
  category?: ProductCategory | 'all';
  brand?: string;
  sport?: SportId | 'all';
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

export async function getProducts(f: ProductFilters = {}): Promise<Result<Product[]>> {
  await delay(180);
  const q = f.q?.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => {
    if (f.category && f.category !== 'all' && p.category !== f.category) return false;
    if (f.brand && f.brand !== 'all' && p.brand !== f.brand) return false;
    if (f.sport && f.sport !== 'all' && p.sport !== f.sport && p.sport !== 'multi') return false;
    if (typeof f.minPrice === 'number' && p.price < f.minPrice) return false;
    if (typeof f.maxPrice === 'number' && p.price > f.maxPrice) return false;
    if (q) {
      const hay = `${p.name.ar} ${p.name.en} ${p.brand}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (f.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (f.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return { data: list, isDemo };
}

export interface ProductPage {
  product: Product;
  vendor: Vendor | null;
  related: Product[];
}

export async function getProduct(id: string): Promise<Result<ProductPage | null>> {
  await delay(140);
  const product = getProductById(id);
  if (!product) return { data: null, isDemo };
  const related = PRODUCTS.filter((p) => p.id !== id && (p.category === product.category || p.sport === product.sport)).slice(0, 4);
  return { data: { product, vendor: getVendorById(product.vendorId) ?? null, related }, isDemo };
}

export async function getSuggestedProducts(limit = 4): Promise<Result<Product[]>> {
  await delay(100);
  return { data: PRODUCTS.slice(0, limit), isDemo };
}

/**
 * رابط الشراء الخارجي مع وسم العمولة إن وُجد.
 * يعيد null عندما لا يوجد رابط (منتج تجريبي) — فلا يُعرض زر شراء فعّال.
 */
export function outboundUrl(product: Product, vendor: Vendor | null): string | null {
  if (!product.buyUrl) return null;
  try {
    const url = new URL(product.buyUrl);
    if (vendor?.affiliateTag) url.searchParams.set('aff', vendor.affiliateTag);
    return url.toString();
  } catch {
    return null;
  }
}
