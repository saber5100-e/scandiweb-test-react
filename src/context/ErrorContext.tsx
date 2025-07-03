import { createContext } from "react";
import { ErrorContextType } from '../lib/types'

const ErrorContext = createContext<ErrorContextType | null>(null);

export default ErrorContext;