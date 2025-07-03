import { createContext } from "react";
import { CategoryContextType } from "../lib/types"; 

const CategoryContext = createContext<CategoryContextType | null>(null);

export default CategoryContext;