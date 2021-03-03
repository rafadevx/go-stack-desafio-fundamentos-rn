import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@carItems');
      if (prods) {
        setProducts(JSON.parse(prods));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProducts = [...products];
      const index = newProducts.findIndex(item => item.id === product.id);
      if (index >= 0) {
        newProducts[index].quantity++;
      } else {
        product.quantity = 1;
        setProducts([...newProducts, product]);
      }
      await AsyncStorage.setItem('@carItems', JSON.stringify(newProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);
      const newProducts = [...products];
      newProducts[index].quantity++;
      setProducts(newProducts);
      await AsyncStorage.setItem('@carItems', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);
      const newProducts = [...products];
      if (newProducts[index].quantity > 0) {
        newProducts[index].quantity--;
      }
      setProducts(newProducts);
      await AsyncStorage.setItem('@carItems', JSON.stringify(newProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
