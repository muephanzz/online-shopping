'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart')
      .select('*, items(*)')
      .eq('user_id', user.id);

    if (!error) {
      setCartItems(data || []);
    } else {
      console.error('Cart fetch error:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
