export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zip: string;
  type: string;
}

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  phone2?: string;
  cpf?: string;
  birthDate?: string;
  customerId?: string;
  addresses: Address[];
}

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  description: string;
}

export interface Cart {
  items: CartItem[];
}

export interface WishlistItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export interface Wishlist {
  items: WishlistItem[];
}

export interface OrderItem extends CartItem {}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: unknown;
  address: Address;
}
