import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
interface CartProviderProps {
  children: ReactNode;
}
interface UpdateProductAmount {
  productId: number;
  amount: number;
}
interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);      
    }

    return [];
  });

  const checkStockProduct = async (productId: number): Promise<Stock> => {
    const responseStock = await api.get(`/stock/${productId}`)
    return responseStock.data
  }  

  const addProduct = async (productId: number) => {
    try {
      const updateCart = [...cart]
      const productOnCart = updateCart.find(item => item.id === productId)
      const responseStockProduct = await checkStockProduct(productId);
      const amountStock = responseStockProduct.amount
      const amountOnCart = productOnCart ? productOnCart.amount : 0
      const newAmount = amountOnCart + 1

      if (newAmount > amountStock) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }        

      if (productOnCart) {
        productOnCart.amount = newAmount;
      } else {
        const responseProducts = await api.get(`/products/${productId}`);
        const newProductToAddaCart = {
          ...responseProducts.data,
          amount: 1          
        }
        updateCart.push(newProductToAddaCart)
      }    
      setCart(updateCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
    } catch (err) {
      toast.error('Erro na adição do produto');   
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updateCart = [...cart]
      const productIndex = updateCart.findIndex(item => item.id === productId)

      if (productIndex >= 0) {
        updateCart.splice(productIndex, 1)
        setCart(updateCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
      } else {
        throw Error()
      }      
    } catch (err) {
      toast.error('Erro na remoção do produto');  
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return
      }

      const stockProduct = await checkStockProduct(productId);
      const stockAmount = stockProduct.amount
      
      if (amount > stockAmount) {       
          toast.error('Quantidade solicitada fora de estoque');   
          return;     
      }

      const updateCart = [...cart]
      const productToUpdate = updateCart.find(item => item.id === productId)

      if (productToUpdate) {
        productToUpdate.amount = amount
        setCart(updateCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
      } else {
        throw Error();
      }      
    } catch (err) {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
