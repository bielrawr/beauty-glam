import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Order } from '../types';

const COLLECTION = 'orders';

/**
 * Salva um novo pedido no Firestore com a data e hora do servidor.
 * @param orderData Dados do pedido sem ID e data de criação.
 * @returns O ID do documento criado.
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    const ordersRef = collection(db, COLLECTION);
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

/**
 * Busca todos os pedidos associados a um UID de usuário específico, ordenados pelos mais recentes.
 * @param userId UID do usuário no Firebase Auth.
 * @returns Lista de objetos de pedido.
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, COLLECTION);
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error;
  }
};
