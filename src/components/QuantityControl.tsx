type Props =  {
    quantity: number,
    handleQuantity: (quantity: number) => void;
}

export default function QuantityControl({ handleQuantity, quantity }: Props) {
    return (
        <div className="input-group mb-3 quanitiy">
            <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleQuantity(Number(quantity - 1))}
            >
                -
            </button>
            <input
                type="number"
                className="form-control text-center"
                value={quantity}
                onChange={(e) => handleQuantity(Number(e.currentTarget.value))}
                min="0"
            />
            <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleQuantity(Number(quantity + 1))}
            >
                +
            </button>
        </div>
    );
}