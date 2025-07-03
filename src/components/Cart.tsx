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
        Product_name: item.Product_Name,
        Quantity: item.quantity,
        Amount: item.Amount
      }));

      try {
        const res = await fetch(`${HTTP_SERVER}/graphql/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `mutation($input: [CartItemInput!]!) {
              order(input: $input) {
                Total_Amount
                ID
                Created_At
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
      {items && items.length > 0 ? (
        items.map(item => (
          <CartItem
            key={`${item.id}-${JSON.stringify(item.attributes)}`}
            setTotalQuantity={setTotalQuantity}
            setItems={setItems}
            items={items}
            item={item}
          />
        ))
      ) : (
        <p>No Items</p>
      )}
      
      <p>total: {totalItemsMsg}</p>
      <p data-testid="cart-total">total price: {(Math.round(totalPrice * 100) / 100).toFixed(2)}</p>
      <button disabled={totalQuantity === 0} onClick={handleOrder} className="btn btn-primary">
        Order
      </button>
    </div>
  );
}