import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "./ProductImages";
import QuantityControl from "./QuantityControl";
import Attribute from "./Attribute";
import CartContext from "../context/CartContext";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import ErrorContext from "../context/ErrorContext";
import useErrorHandler from "../lib/errorHandler";
import { ProductType, AttributeSelectionsType, CartItemType } from '../lib/types'
import { HTTP_SERVER } from "../lib/constants";

type Props = {
  showCart: boolean;
  setShowCart: (value: boolean) => void;
};

export default function ProductPage({ showCart, setShowCart }: Props) {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("CartContext must be used within a CartProvider");
  }

  const { setCartItemsState } = cartContext;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
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
        const res = await fetch(`${HTTP_SERVER}/graphql/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query Product {
              product(id: "${id}") {
                ID
                Product_Name
                In_Stock
                Description
                Category
                Brand
                Products_gallery {
                  ID
                  Product_ID
                  URL
                }
                Products_Attributes {
                  ID
                  Primary_ID
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
                Product_Prices {
                  Currency_Label
                  Currency_Symbol
                  Amount 
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
        fetchedProduct.Products_Attributes.forEach((attribute) => {
          newAttributes[attribute.ID] = "";
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

  function handleQuantity(newQuantity: number) {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  }

  function addToCart() {
    const allSelected = Object.values(attributes).every((value) => value !== "");

    if (!allSelected) {
      setIsError(true);
      setMsg("Please make sure all the attributes are selected.");
      return;
    }

    if (product?.In_Stock) {
      setIsError(false);
      setMsg("");

      const localItems: CartItemType[] = JSON.parse(localStorage.getItem("items") || "[]");

      const newItem: CartItemType = {
        attributes,
        quantity,
        id: product.ID,
        Product_Name: product.Product_Name,
        Amount: product.Product_Prices?.[0]?.Amount || 0,
        Image: product.Products_gallery[0]?.URL || "",
        Symbol: product.Product_Prices?.[0]?.Currency_Symbol || "",
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

  const isDisabled = !Object.values(attributes).every((val) => val !== "");

  return (
    <div className={`container mt-5 ${showCart ? "cart-opened" : ""}`}>
      <div className="row py-3">
        <div className="col-md-6">
          {product?.Products_gallery && <ProductImages images={product.Products_gallery} />}
        </div>
        <div className="col-md-6">
          <h1 className="display-1">{product?.Product_Name}</h1>
          <h6 className="display-6">Brand: {product?.Brand}</h6>
          {!product?.In_Stock && <span className="out-of-stock mt-2">out of stock</span>}

          {product?.Products_Attributes?.map((attribute) => (
            <Attribute
              key={attribute.ID}
              attribute={attribute}
              setAttributes={setAttributes}
            />
          ))}

          {product?.Product_Prices?.[0] && (
            <span className="price d-block">
              Price: {product.Product_Prices[0].Amount}
              {product.Product_Prices[0].Currency_Symbol} {product.Product_Prices[0].Currency_Label}
            </span>
          )}

          <QuantityControl handleQuantity={handleQuantity} quantity={quantity} />

          <button
            data-testid="add-to-cart"
            onClick={addToCart}
            disabled={isDisabled}
            type="button"
            className="btn btn-primary mb-2"
          >
            add to cart
          </button>

          <div className="description">
            {product?.Description &&
              parse(
                DOMPurify.sanitize(
                  `<p data-testid='product-description'>Description:</p> ${product.Description}`
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}