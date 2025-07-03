import kebabize from "../lib/kebabize";
import {ItemType, AttributeType} from '../lib/types';

type Props = {
    item: ItemType,
    attribute: AttributeType,
    setInputState: React.Dispatch<React.SetStateAction<string>>,
    inputState: string
}

export default function AttributeSwatch({ item, attribute, setInputState, inputState }: Props) {
    return (
        <div data-testid={`product-attribute-${kebabize(attribute.Attribute_Name)}-${item.Display_Value}`} className="d-inline-block mr-1">
            <input
                type="radio"
                id={String(item.Primary_ID)}
                name={attribute.Attribute_Name}
                value={item.Item_Value}
                onChange={(e) => setInputState(e.target.value)}
                checked={inputState === item.Item_Value}
                autoComplete="off"
                className="d-none"
            />
            <label
                htmlFor={String(item.Primary_ID)}
                className="d-inline-block"
                style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: item.Item_Value,
                    border: inputState === item.Item_Value ? "2px solid #27ae60" : "1px solid #ccc",
                    cursor: "pointer"
                }}
            />
        </div>
    );
}