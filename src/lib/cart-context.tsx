import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartProduct {
  id_produk: string;
  nama_produk: string;
  harga_jual: number;
  kategori?: string;
  stok_gudang_utama: number;
  image_url?: string;
  qty: number;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: Omit<CartProduct, 'qty'>) => void;
  removeFromCart: (id_produk: string) => void;
  updateQty: (id_produk: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addToCart = (product: Omit<CartProduct, 'qty'>) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id_produk === product.id_produk);
      if (existing) {
        return prev.map((item) =>
          item.id_produk === product.id_produk
            ? { ...item, qty: Math.min(item.qty + 1, product.stok_gudang_utama) }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id_produk: string) => {
    setCart((prev) => prev.filter((item) => item.id_produk !== id_produk));
  };

  const updateQty = (id_produk: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id_produk === id_produk) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: Math.min(newQty, item.stok_gudang_utama) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartProduct[]
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + item.harga_jual * item.qty, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalAmount,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
