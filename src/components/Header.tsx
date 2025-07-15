import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import CartContext from "../context/CartContext";
import CategoryContext from '../context/CategoryContext';

import useErrorHandler from "../lib/errorHandler";
import {CategoriesType, ItemsType} from '../lib/types';
import { HTTP_SERVER } from "../lib/constants";

import CartVector from "./CartVector";

import Cart from "./Cart";

interface Props {
  showCart: boolean;
  setShowCart: (value: boolean) => void;
}

export default function Header({ showCart, setShowCart }: Props) {
  const [categories, setCategories] = useState<CategoriesType>([]);
  const [items, setItems] = useState<ItemsType>([]);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);

  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { setTotalPrice, cartItemsState } = cartContext;
  const categoryContext = useContext(CategoryContext);

  if (!categoryContext) {
    throw new Error("CategoryContext must be used within a CategoryProvider");
  }

  const { currentCategory, setCurrentCategory } = categoryContext;

  const { catchedError, serverError } = useErrorHandler();
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${HTTP_SERVER}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: "query Categories { categories { id category_name } }"
          })
        });

        if (!res.ok) {
          serverError(res.status);
          return;
        }

        const data = await res.json();
        setCategories(data.data.categories);
      } catch (error) {
        if (error instanceof Error) {
          catchedError(error);
        } else {
          catchedError(new Error("An unexpected error occurred"));
        }
      }
    }

    fetchData();
  }, [catchedError, serverError]);

  useEffect(() => {
    const pathSegments = location.pathname.toLowerCase().split('/');
    const firstSegment = pathSegments[1];
  
    const categoryNames = categories.map(cat => cat.category_name.toLowerCase());
  
    if (categoryNames.includes(firstSegment)) {
      setCurrentCategory(firstSegment);
    }
  
    if (!categoryNames.includes(firstSegment) && currentCategory === '' && categoryNames.length > 0) {
      setCurrentCategory(categoryNames[0]);
    }
  }, [categories, location.pathname, setCurrentCategory, currentCategory]);

  useEffect(() => {
    const localItems: ItemsType = JSON.parse(localStorage.getItem('items') || '[]');
    setItems(localItems);

    const totalQuantity = localItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalQuantity);

    const totalPrice = localItems.reduce((sum, item) => sum + item.quantity * item.amount, 0);
    setTotalPrice(totalPrice);
  }, [cartItemsState, setTotalPrice]);

  function handleClick() {
    setShowCart(!showCart);
  }

  return (
    <>
      <header className="navbar">
        <nav>
          {categories.map((category) => {
              const isActive = category.category_name.toLowerCase() === currentCategory.toLowerCase();
              const dataTestid = isActive ? "active-category-link" : "category-link";

              return (
                <li key={category.id} className="nav-item">
                  <Link
                    className={isActive ? ' active' : ''}
                    onClick={() => setCurrentCategory(category.category_name)}
                    data-testid={dataTestid}
                    to={`/${category.category_name}`}
                  >
                    {category.category_name.charAt(0).toUpperCase() + category.category_name.slice(1)}
                  </Link>
                </li>
              );
            })}
        </nav>

        <div className="logo">
          <img src="/logo transparent.png" alt="logo" />
        </div>

        <div className="icons">
          <div data-testid='cart-btn' onClick={handleClick} className="cart-icon-wrapper">
            <CartVector />
            {totalQuantity ? <span className="cart-count">{totalQuantity > 9 ? `9+` : totalQuantity}</span> : <></>}
          </div>
        </div>
      </header>

      {showCart && (
        <Cart
          setTotalQuantity={setTotalQuantity}
          totalQuantity={totalQuantity}
          items={items}
          setItems={setItems}
        />
      )}
    </>
  );
}