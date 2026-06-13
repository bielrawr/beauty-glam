import { WishlistItem } from '../types';

export const encodeWishlistShare = (items: WishlistItem[]): string => {
  const payload = items.map(({ productId, title, price, image, description, category }) => ({
    productId,
    title,
    price,
    image,
    description,
    category,
  }));

  return btoa(encodeURIComponent(JSON.stringify(payload)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeWishlistShare = (value: string | null): WishlistItem[] => {
  if (!value) return [];

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
    const parsed = JSON.parse(decodeURIComponent(atob(normalized + padding)));

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is WishlistItem => (
      typeof item?.productId === 'number' &&
      typeof item?.title === 'string' &&
      typeof item?.price === 'number' &&
      typeof item?.image === 'string' &&
      typeof item?.description === 'string' &&
      typeof item?.category === 'string'
    ));
  } catch {
    return [];
  }
};

