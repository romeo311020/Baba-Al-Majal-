import type { Lang } from '../types';
import ar from './ar';
import en from './en';

export const dictionaries: Record<Lang, Record<string, string>> = { ar, en };
