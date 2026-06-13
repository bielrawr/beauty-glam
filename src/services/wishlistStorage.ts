import { Wishlist } from '../types';

const WISHLIST_KEY = '@beautyglam:wishlist';

const getWishlistKey = (userId?: string | null) => (
  userId ? `${WISHLIST_KEY}:${userId}` : WISHLIST_KEY
);

export const saveWishlist = (wishlist: Wishlist, userId?: string | null): void => {
  localStorage.setItem(getWishlistKey(userId), JSON.stringify(wishlist));
};

export const loadWishlist = (userId?: string | null): Wishlist => {
  try {
    const saved = localStorage.getItem(getWishlistKey(userId));
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
};

export const clearWishlistStorage = (userId?: string | null): void => {
  localStorage.removeItem(getWishlistKey(userId));
};
