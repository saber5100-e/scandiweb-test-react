import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductImages from "./ProductImages";
import Attribute from "./Attribute";
import CartContext from "../context/CartContext";

import parse from "html-react-parser";
import DOMPurify from "dompurify";

import ErrorContext from "../context/ErrorContext";

import useErrorHandler from "../lib/errorHandler";

import { ProductType, AttributeSelectionsType, CartItemType } from '../lib/types'
import { HTTP_SERVER } from "../lib/constants";
import kebabize from "../lib/kebabize";

type Props = {
  setShowCart: (value: boolean) => void;
};

export default function ProductPage({ setShowCart }: Props) {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { setCartItemsState } = cartContext;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity] = useState<number>(1);
  const [attributes, setAttributes] = useState<AttributeSelectionsType>({});

  const errorContext = useContext(ErrorContext);

  if (!errorContext) {
    throw new Error("errorContext must be used within a CategoryProvider");
  }

  const { setMsg, setIsError } = errorContext;

  const { catchedError, serverError } = useErrorHandler();
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${HTTP_SERVER}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query Product {
              product(id: "${id}") {
                  id
                  product_name
                  in_stock
                  description
                  category
                  brand
                  products_gallery {
                      url
                      id
                  }
                  products_attributes {
                      primary_id
                      id
                      attribute_name
                      attribute_type
                      attributes_items {
                          primary_id
                          id
                          display_value
                          item_value
                          attribute_id
                      }
                  }
                  product_prices {
                      amount
                      currency {
                          id
                          label
                          symbol
                      }
                  }
              }
          }`,
          }),
        });
  
        if (!res.ok) {
          serverError(res.status);
          return;
        }
  
        const data = await res.json();
        const fetchedProduct: ProductType = data.data.product;
        setProduct(fetchedProduct);
  
        const newAttributes: AttributeSelectionsType = {};
        fetchedProduct.products_attributes.forEach((attribute) => {
          newAttributes[attribute.id] = "";
        });
        setAttributes(newAttributes);
      } catch (error) {
        if (error instanceof Error) {
          catchedError(error);
        } else {
          catchedError(new Error("An unexpected error occurred"));
        }
      }
    }
  
    fetchData();
  }, [id, catchedError, serverError]);

  function addToCart() {
    const allSelected = Object.values(attributes).every((value) => value !== "");

    if (!allSelected) {
      setIsError(true);
      setMsg("Please make sure all the attributes are selected.");
      return;
    }

    if (product?.in_stock) {
      setIsError(false);
      setMsg("");

      const localItems: CartItemType[] = JSON.parse(localStorage.getItem("items") || "[]");

      const newItem: CartItemType = {
        attributes,
        quantity,
        id: product.id,
        product_name: product.product_name,
        amount: product.product_prices?.[0]?.amount || 0,
        image: product.products_gallery[0]?.url || "",
        symbol: product.product_prices?.[0]?.currency.symbol || "",
      };

      const existingIndex = localItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          JSON.stringify(item.attributes) === JSON.stringify(newItem.attributes)
      );

      if (existingIndex > -1) {
        localItems[existingIndex].quantity += newItem.quantity;
      } else {
        localItems.push(newItem);
      }

      localStorage.setItem("items", JSON.stringify(localItems));
      setCartItemsState(localItems);
      setShowCart(true);
      setMsg("item added to cart successfully");
    }
  }

  const isDisabled = !(Object.values(attributes).every((val) => val !== "") && product?.in_stock);

  return (
    <div className={`product-container mb`}>
      <div className="product-detail">
          {product?.products_gallery && <ProductImages images={product.products_gallery} />}

        <div className="product-info">
          <h2 className="display-1">{product?.product_name}</h2>

          {product?.products_attributes?.map((attribute) => (
            <div key={attribute.id} className="product-option" data-testid={`product-attribute-${kebabize(attribute.attribute_name)}`}>
              <label>{attribute.attribute_name}: </label>
              <div className="btns" role="group" aria-label="Basic radio toggle button group">
              <Attribute
                  attribute={attribute}
                  setAttributes={setAttributes}
                />
              </div>
            </div>
          ))}

          {product?.product_prices?.[0] && (
            <div className="price">
              <label>PRICE:</label>
              <h2>{product.product_prices[0].amount} {product.product_prices[0].currency.symbol} {product.product_prices[0].currency.label}</h2>
            </div>
          )}

          <button
            data-testid="add-to-cart"
            onClick={addToCart}
            disabled={isDisabled}
            type="button"
            className="add-to-cart"
          >
            add to cart
          </button>

          <div className="description" data-testid="product-description">
            {product?.description && parse(DOMPurify.sanitize(product.description))}
          </div>

        </div>
      </div>
    </div>
  );
}