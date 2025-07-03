import { useEffect, useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CartContext from "../context/CartContext";
import kebabize from "../lib/kebabize";
import ErrorContext from "../context/ErrorContext";
import useErrorHandler from "../lib/errorHandler";

import { ProductType, QuickShopProductType } from '../lib/types';
import { HTTP_SERVER } from "../lib/constants";

type Props = { showCart: boolean; }

export default function Categories({ showCart }: Props) {
    const [products, setProducts] = useState<ProductType[]>([]);
    const { id } = useParams<{ id: string }>();
    const cartContext = useContext(CartContext);

    if (!cartContext) {
        throw new Error("CartContext must be used within a CartProvider");
    }

    const { setCartItemsState } = cartContext;


    const errorContext = useContext(ErrorContext);

  if (!errorContext) {
    throw new Error("errorContext must be used within a CategoryProvider");
  }

    const { setMsg, setIsError } = errorContext;
    const { catchedError, serverError } = useErrorHandler();

    useEffect(() => {
        async function fetchData() {
            const upperCaseId = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'All';

            try {
                const res = await fetch(`${HTTP_SERVER}/graphql/categories`, {
                    method: "POST",
                    body: JSON.stringify({
                        query: `query Category {
                            category(Category_Name: "${upperCaseId}") {
                                ID
                                Product_Name
                                In_Stock
                                Products_gallery {
                                    ID
                                    Product_ID
                                    URL
                                }
                                Product_Prices {
                                    Currency_Symbol
                                    Amount
                                }
                            }
                        }`
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    serverError(res.status);
                    return;
                }

                const data = await res.json();
                setProducts(data.data.category);
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

    async function handleQuickShop(ID: string) {
        try {
            const res = await fetch(`${HTTP_SERVER}/graphql/products`, {
                method: "POST",
                body: JSON.stringify({
                    query: `query Product {
                        product(id: "${ID}") {
                            ID
                            Product_Name
                            In_Stock
                            Products_gallery {
                                ID
                                Product_ID
                                URL
                            }
                            Products_Attributes {
                                ID
                                Product_ID
                                Attribute_Name
                                Attributes_Items {
                                    Attribute_ID
                                    Item_Value
                                }
                            }
                            Product_Prices {
                                Amount
                                Currency_Symbol
                            }
                        }
                    }`
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                setIsError(true);
                setMsg(`Server Error, Status: ${res.status}`);
                throw new Error(`Server Error, Status: ${res.status}`);
            }

            const data = await res.json();
            const product: QuickShopProductType = data.data.product;

            const attributes: Record<string, string> = {};
            if (product.Products_Attributes) {
                product.Products_Attributes.forEach(attr => {
                    if (attr.Attributes_Items.length > 0) {
                        attributes[attr.ID] = attr.Attributes_Items[0].Item_Value;
                    }
                });
            }

            if (product.In_Stock) {
                setIsError(false);
                setMsg('');
                const localItems: any[] = JSON.parse(localStorage.getItem('items') || '[]');

                const newItem = {
                    attributes,
                    quantity: 1,
                    id: product.ID,
                    Product_Name: product.Product_Name,
                    Amount: product.Product_Prices?.[0]?.Amount,
                    Image: product.Products_gallery[0]?.URL,
                    Symbol: product.Product_Prices?.[0]?.Currency_Symbol
                };

                const existingIndex = localItems.findIndex(item =>
                    item.id === newItem.id && JSON.stringify(item.attributes) === JSON.stringify(newItem.attributes)
                );

                if (existingIndex > -1) {
                    localItems[existingIndex].quantity += newItem.quantity;
                } else {
                    localItems.push(newItem);
                }

                localStorage.setItem('items', JSON.stringify(localItems));
                setCartItemsState(localItems);
                setMsg('item added to cart successfully');
            }
        } catch (error: any) {
            setIsError(true);
            setMsg(`Error: ${error.message}`);
        }
    }

    return (
        <div className={`container ${showCart ? 'cart-opened' : ''}`}>
            <h1 className="page-title px-3 pt-3 mt-5">{id ? id : "All"}</h1>
            <div className="row p-3">
                {products.map(product => (
                    <div data-testid={`product-${kebabize(product.Product_Name)}`} className="col-md-4 mb-4" key={product.ID}>
                        <div className="position-relative product-card border p-3 rounded text-center">
                            <Link to={`/products/${product.ID}`}>
                                <img
                                    className={`product-image img-fluid mb-2 ${!product.In_Stock ? "grey-out" : ''}`}
                                    src={product.Products_gallery[0]?.URL}
                                    alt={product.Product_Name}
                                />
                                <h2 className="h5 product-link">{product.Product_Name}</h2>
                            </Link>

                            <span className="d-block text-muted mb-1">
                                {product.Product_Prices[0]?.Currency_Symbol}{product.Product_Prices[0]?.Amount}
                            </span>
                            <span
                                className="text-danger d-block mb-2"
                                style={{ visibility: product.In_Stock ? "hidden" : "visible" }}
                            >
                                out of stock
                            </span>

                            {product.In_Stock && (
                                <button onClick={() => handleQuickShop(product.ID)} className="btn btn-primary btn-sm add-to-cart-btn position-absolute bottom-0 start-50 translate-middle-x">
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}