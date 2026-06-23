import React, { createContext, useContext, useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    nameAr?: string | null;
    slug: string;
    price: string;
    salePrice: string | null;
    image: string | null;
    stockQuantity: number | null;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  total: 0,
  isOpen: false,
  setIsOpen: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isLoading: false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: cartData, isLoading } = trpc.cart.get.useQuery();
  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      setIsOpen(true);
    },
  });
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });
  const updateMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });
  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  const addToCart = useCallback(
    (productId: number, quantity = 1) => {
      addMutation.mutate({ productId, quantity });
    },
    [addMutation]
  );

  const removeFromCart = useCallback(
    (itemId: number) => {
      removeMutation.mutate({ itemId });
    },
    [removeMutation]
  );

  const updateQuantity = useCallback(
    (itemId: number, quantity: number) => {
      updateMutation.mutate({ itemId, quantity });
    },
    [updateMutation]
  );

  const clearCart = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

  return (
    <CartContext.Provider
      value={{
        items: (cartData?.items as CartItem[]) || [],
        itemCount: cartData?.itemCount || 0,
        total: cartData?.total || 0,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
