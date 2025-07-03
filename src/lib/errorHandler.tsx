import { useContext, useCallback } from "react";
import ErrorContext from "../context/ErrorContext";

export default function useErrorHandler() {
  const errorContext = useContext(ErrorContext);

  if (!errorContext) {
    throw new Error("ErrorContext must be used within an ErrorProvider");
  }

  const { setMsg, setIsError } = errorContext;

  const serverError = useCallback(
    (status: number) => {
      setIsError(true);
      setMsg(`Server Error, Status: ${status}`);
      throw new Error(`Server Error, Status: ${status}`);
    },
    [setIsError, setMsg]
  );

  const catchedError = useCallback(
    (error: Error) => {
      setIsError(true);
      setMsg(`Error: ${error.message}`);
    },
    [setIsError, setMsg]
  );

  return { serverError, catchedError };
}