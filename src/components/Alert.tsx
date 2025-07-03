import { useContext } from "react";
import ErrorContext from "../context/ErrorContext";

export default function Alert() {
    const errorContext = useContext(ErrorContext);

  if (!errorContext) {
    throw new Error("errorContext must be used within a CategoryProvider");
  }

  const {msg, setMsg, isError} = errorContext;

    if (!msg) {
        return null;
    }

    function handleClose() {
        setMsg("");
    }

    return (
        <div className={`container alert ${ isError ? "alert-danger" : "alert-success" } d-flex justify-content-between`} role="alert">
            <span>{msg}</span><span onClick={handleClose} style={{ cursor: "pointer" }}>X</span>
        </div>
    );
}