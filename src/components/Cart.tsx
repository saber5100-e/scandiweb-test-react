import { useContext } from "react";

import CartItem from "./CartItem";

import CartContext from "../context/CartContext";

import useErrorHandler from "../lib/errorHandler";
import { CartItemType } from "../lib/types";
import { HTTP_SERVER } from "../lib/constants";

type Props = {
  items: CartItemType[];
  setItems: (items: CartItemType[]) => void;
  totalQuantity: number;
  setTotalQuantity: (qty: number) => void;
}

export default function Cart({ setItems, items, totalQuantity, setTotalQuantity }: Props) {
  const cartContext = useContext(CartContext);

if (!cartContext) {
  throw new Error("CartContext must be used within a CartProvider");
}

const { totalPrice, setTotalPrice } = cartContext;

  
  const { catchedError, serverError } = useErrorHandler();

  async function handleOrder() {
    if (totalQuantity > 0) {
      const itemsForOrder = items.map(item => ({
        ID: item.id,
        Product_name: item.product_name,
        Quantity: item.quantity,
        Amount: item.amount
      }));

      try {
        const res = await fetch(`${HTTP_SERVER}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `mutation($input: [CartItemInput!]!) {
              order(input: $input) {
                total_amount
                id
                created_at
              }
            }`,
            variables: {
              input: itemsForOrder
            }
          })
        });

        if (!res.ok) {
          serverError(res.status);
          return;
        }

        setItems([]);
        setTotalQuantity(0);
        setTotalPrice(0);
        localStorage.removeItem("items");
      } catch (error) {
        if (error instanceof Error) {
          catchedError(error);
        } else {
          catchedError(new Error("An unexpected error occurred"));
        }
      }
    }
  }

  const totalItemsMsg = totalQuantity > 1 ? `${totalQuantity} items` : `${totalQuantity} item`;

  return (
    <div data-testid="cart-overlay" className="cart">
      <h3 className="my-bag">My Bag, <span className="items-count">{totalItemsMsg}</span></h3>

        {items && items.length > 0 ? (
          items.map((item, i) => (
            <CartItem
              key={`${item.id}-${JSON.stringify(item.attributes)}`}
              setTotalQuantity={setTotalQuantity}
              setItems={setItems}
              items={items}
              item={item}
              isLast={i + 1 === items.length ? 'last' : ''}
            />
          ))
        ) : (
          <p>No Items</p>
      )}
      
      <div className="cart-total">
        <p>total</p>
        <span>${(Math.round(totalPrice * 100) / 100).toFixed(2)}</span>
      </div>

      <div className="cart-order">
        <button disabled={totalQuantity === 0} onClick={handleOrder}>
          PLACE ORDER
        </button>
      </div>
    </div>
  );
}