import { useContext, useEffect, useState } from "react";
import CartContext from "../context/CartContext";
import CartItemAttribute from "./CartItemAttribute";
import useErrorHandler from "../lib/errorHandler";
import {ProductDetailsType, CartItemType} from '../lib/types';
import { HTTP_SERVER } from "../lib/constants";

type Props = {
  item: CartItemType;
  items: CartItemType[];
  setItems: (items: CartItemType[]) => void;
  setTotalQuantity: (qty: number) => void;
}

export default function CartItem({ item, items, setItems, setTotalQuantity }: Props) {
  const cartContext = useContext(CartContext);

    if (!cartContext) {
      throw new Error("CartContext must be used within a CartProvider");
    }
    
    const { setTotalPrice, cartItemsState, setCartItemsState } = cartContext;

  const { catchedError, serverError } = useErrorHandler();
  const [fullItems, setFullItems] = useState<ProductDetailsType[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${HTTP_SERVER}/graphql/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query Category {
              category(Category_Name: "All") {
                ID
                Products_Attributes {
                  ID
                  Attribute_Name
                  Attribute_Type
                  Attributes_Items {
                    Primary_ID
                    ID
                    Attribute_ID
                    Display_Value
                    Item_Value
                  }
                }
              }
            }`
          })
        });

        if (!res.ok) {
          serverError(res.status);
          return;
        }

        const data = await res.json();
        const matchedItems = data.data.category.filter((fullItem: ProductDetailsType) => fullItem.ID === item.id);
        setFullItems(matchedItems);
      } catch (error) {
        if (error instanceof Error) {
          catchedError(error);
        } else {
          catchedError(new Error("An unexpected error occurred"));
        }
      }
    }

    if (item?.id) fetchData();
  }, [item.id, catchedError, serverError]);

  function handleRemove() {
    const updatedCart = (cartItemsState as CartItemType[]).filter(
      cartItem =>
        !(cartItem.id === item.id && JSON.stringify(cartItem.attributes) === JSON.stringify(item.attributes))
    );
    setCartItemsState(updatedCart);

    const updatedStorage = (JSON.parse(localStorage.getItem("items") || "[]") as CartItemType[]).filter(
      localItem =>
        !(localItem.id === item.id && JSON.stringify(localItem.attributes) === JSON.stringify(item.attributes))
    );
    localStorage.setItem("items", JSON.stringify(updatedStorage));
  }

  function handleQuantity(sign: "+" | "-") {
    const index = items.findIndex(
      i => i.id === item.id && JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
    );
    if (index === -1) return;

    const updatedItems = [...items];

    if (sign === "+") {
      updatedItems[index].quantity += 1;
    } else if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
    } else {
      handleRemove();
      const filtered = updatedItems.filter((_, i) => i !== index);
      setItems(filtered);
      updateTotals(filtered);
      return;
    }

    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
    updateTotals(updatedItems);
  }

  function updateTotals(cart: CartItemType[]) {
    const totalQuantity = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.quantity * i.Amount, 0);
    setTotalQuantity(totalQuantity);
    setTotalPrice(totalPrice);
  }

  return (
    <div>
      <p className="cart-product-name">{item.Product_Name}</p>
      <img alt={item.Product_Name} className="img-fluid" src={item.Image} />
      <p data-testid="cart-item-amount">
        price: {item.Symbol}
        {item.Amount}
      </p>
      <p>
        quantity:
        <button
          onClick={() => handleQuantity("+")}
          className="btn btn-primary quantity-btn"
          data-testid="cart-item-amount-increase"
        >
          +
        </button>
        {item.quantity}
        <button
          onClick={() => handleQuantity("-")}
          className="btn btn-primary quantity-btn"
          data-testid="cart-item-amount-decrease"
        >
          -
        </button>
      </p>
      {fullItems.length > 0 &&
        fullItems.map(fullItem => (
          <CartItemAttribute
            key={fullItem.ID}
            selectedAttributes={item.attributes}
            product_attributes={fullItem.Products_Attributes}
          />
        ))}
      <button className="btn btn-primary cart-btn" onClick={handleRemove}>
        remove item
      </button>
    </div>
  );
}