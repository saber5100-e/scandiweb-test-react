import { useEffect, useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";

import CartContext from "../context/CartContext";
import ErrorContext from "../context/ErrorContext";

import kebabize from "../lib/kebabize";
import useErrorHandler from "../lib/errorHandler";

import CartVector from "./CartVector";

import { ProductType, QuickShopProductType } from '../lib/types';
import { HTTP_SERVER } from "../lib/constants";

export default function Categories() {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
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
                const res = await fetch(`${HTTP_SERVER}/graphql`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: `query Category {
                            category(category_name: "${upperCaseId}") {
                                id
                                product_name
                                in_stock
                                products_gallery {
                                    url
                                    id
                                }
                                product_prices {
                                    id
                                    amount
                                    currency {
                                        id
                                        label
                                        symbol
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

    async function handleQuickShop(id: string) {
        try {
            const res = await fetch(`${HTTP_SERVER}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `query Products {
                        product(id: "${id}") {
                            id
                            product_name
                            in_stock
                            products_gallery {
                                url
                                id
                            }
                            products_attributes {
                                id
                                product_id
                                attribute_name
                                attributes_items {
                                    item_value
                                    attribute_id
                                }
                            }
                            product_prices {
                                amount
                                currency {
                                    symbol
                                }
                            }
                        }
                    }`
                })
            });

            if (!res.ok) {
                setIsError(true);
                setMsg(`Server Error, Status: ${res.status}`);
                throw new Error(`Server Error, Status: ${res.status}`);
            }

            const data = await res.json();
            const product: QuickShopProductType = data.data.product;

            const attributes: Record<string, string> = {};
            if (product.products_attributes) {
                product.products_attributes.forEach(attr => {
                    if (attr.attributes_items.length > 0) {
                        attributes[attr.id] = attr.attributes_items[0].item_value;
                    }
                });
            }

            if (product.in_stock) {
                setIsError(false);
                setMsg('');
                const localItems: any[] = JSON.parse(localStorage.getItem('items') || '[]');

                const newItem = {
                    attributes,
                    quantity: 1,
                    id: product.id,
                    product_name: product.product_name,
                    amount: product.product_prices?.[0]?.amount,
                    image: product.products_gallery[0]?.url,
                    symbol: product.product_prices?.[0]?.currency.symbol
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
        <div className={`container mb`}>
            <h1 className="title">{id ? id : "All"}</h1>

            <div className="product-grid">
                {products.map(product => (
                    <div 
                        onMouseEnter={() => setHoveredId(product.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        data-testid={`product-${kebabize(product.product_name)}`}
                        className={`product ${!product.in_stock ? 'out-of-stock' : ''} ${hoveredId === product.id ? 'shadowed' : ''}`} 
                        key={product.id}
                    >
                        <Link className="unstyled-link" to={`/products/${product.id}`}>
                            <div className="image-wrapper">
                                <img src={product.products_gallery[0].url} alt={product.product_name}/>
                                {product.in_stock ? '' : <div className="overlay">OUT OF STOCK</div>}
                                {product.in_stock && hoveredId === product.id && (
                                    <div onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuickShop(product.id)
                                    }} className="cart-button">
                                        <CartVector />
                                    </div>
                                    )}
                            </div>

                            <p className="h5 product-link">{product.product_name}</p>
                            <span>{product.product_prices[0].currency.symbol}{product.product_prices[0].amount}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}