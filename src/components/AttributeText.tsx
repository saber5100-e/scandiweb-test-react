import kebabize from "../lib/kebabize";
import {ItemType, AttributeType} from '../lib/types';

type Props = {
    item: ItemType;
    attribute: AttributeType;
    setInputState: React.Dispatch<React.SetStateAction<string>>;
    inputState: string;
};

export default function AttributeText({ item, attribute, setInputState, inputState }: Props) {
    return (
        <div data-testid={`product-attribute-${kebabize(attribute.Attribute_Name)}-${item.Display_Value}`}>
            <input
                type="radio"
                className="btn-check"
                id={String(item.Primary_ID)}
                name={attribute.Attribute_Name}
                value={item.Item_Value}
                onChange={(e) => setInputState(e.target.value)}
                checked={inputState === item.Item_Value}
                autoComplete="off"
            />
            <label className="btn btn-outline-primary" htmlFor={String(item.Primary_ID)}>
                {item.Display_Value}
            </label>
        </div>
    );
}