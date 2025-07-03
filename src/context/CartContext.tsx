import { createContext } from "react";
import { CartContextType } from "../lib/types";

const CartContext = createContext<CartContextType | null>(null);

export default CartContext;