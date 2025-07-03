import { useContext, useEffect, useState } from "react";
import Cart from "./Cart";
import { Link, useLocation } from "react-router-dom";
import CartContext from "../context/CartContext";
import CategoryContext from '../context/CategoryContext';
import useErrorHandler from "../lib/errorHandler";
import {CategoriesType, ItemsType} from '../lib/types';
import { HTTP_SERVER } from "../lib/constants";

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
        const res = await fetch(`${HTTP_SERVER}/graphql/categories`, {
          method: "POST",
          body: JSON.stringify({
            query: "query Categories { categories { ID Category_Name } }"
          }),
          headers: { "Content-Type": "application/json" }
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
    const pathCategory = location.pathname.toLowerCase().split('/')[1];
    if (pathCategory && pathCategory !== currentCategory) {
      setCurrentCategory(pathCategory);
    }
  }, [location.pathname, currentCategory, setCurrentCategory]);

  useEffect(() => {
    const localItems: ItemsType = JSON.parse(localStorage.getItem('items') || '[]');
    setItems(localItems);

    const totalQuantity = localItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(totalQuantity);

    const totalPrice = localItems.reduce((sum, item) => sum + item.quantity * item.Amount, 0);
    setTotalPrice(totalPrice);
  }, [cartItemsState, setTotalPrice]);

  function handleClick() {
    setShowCart(!showCart);
  }

  return (
    <>
      <header className="navbar fixed-top navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {categories.map((category) => {
                const isActive = category.Category_Name.toLowerCase() === currentCategory.toLowerCase();
                const dataTestid = isActive ? "active-category-link" : "category-link";
                const linkClasses = isActive ? "nav-link active" : "nav-link";

                return (
                  <li key={category.ID} className="nav-item">
                    <Link
                      className={linkClasses}
                      onClick={() => setCurrentCategory(category.Category_Name)}
                      data-testid={dataTestid}
                      to={`/${category.Category_Name}`}
                    >
                      {category.Category_Name.charAt(0).toUpperCase() + category.Category_Name.slice(1)}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              data-testid="cart-btn"
              className="btn btn-outline-secondary position-relative"
              onClick={handleClick}
            >
              {showCart ? "Hide Cart" : "Show Cart"}
              {totalQuantity && !showCart ? (
                <span
                  className="position-absolute top-0 end-0 badge rounded-pill bg-danger"
                  style={{ transform: 'translate(30%, -30%)' }}
                >
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                  <span className="visually-hidden">items in cart</span>
                </span>
              ) : null}
            </button>
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