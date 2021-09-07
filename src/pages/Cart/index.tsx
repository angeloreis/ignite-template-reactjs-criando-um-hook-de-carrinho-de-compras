import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

   const cartFormatted = cart.map((productLine: Product) => ({
    ...productLine,
    priceFormatted: formatPrice(productLine.price),
    subtotal: formatPrice(productLine.price * productLine.amount)
  }))

   const total =
     formatPrice(
       cart.reduce((sumTotal, product) => {
         sumTotal += product.price * product.amount;
         return sumTotal;
       }, 0)
   )

  function handleProductIncrement(product: Product) {
    updateProductAmount({productId: product.id, amount: product.amount + 1})
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({productId: product.id, amount: product.amount - 1})
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(cartLine => (
            <tr data-testid="product" key={cartLine.id}>
            <td>
              <img src={cartLine.image} alt={cartLine.title} />
            </td>
            <td>
              <strong>{cartLine.title}</strong>
              <span>{cartLine.priceFormatted}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                  disabled={cartLine.amount <= 1}
                 onClick={() => handleProductDecrement(cartLine)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={cartLine.amount}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                 onClick={() => handleProductIncrement(cartLine)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{cartLine.subtotal}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
                onClick={() => handleRemoveProduct(cartLine.id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>

          ))}
          
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
