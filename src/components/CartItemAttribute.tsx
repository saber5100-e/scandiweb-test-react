import { useId } from 'react';
import kebabize from '../lib/kebabize';
import {SelectedAttributesType, ProductAttributeType} from '../lib/types';

type Props = {
    product_attributes: ProductAttributeType[];
    selectedAttributes: SelectedAttributesType;
};

export default function CartItemAttribute({ product_attributes, selectedAttributes }: Props) {
    const idPrefix = useId();

    return (
        <>
            {product_attributes.map(attribute => (
                <div data-testid={`cart-item-attribute-${kebabize(attribute.Attribute_Name)}`} key={attribute.ID}>
                    <p>{attribute.Attribute_Name}:</p>

                    {attribute.Attributes_Items.map(item => {
                        const inputId = `${idPrefix}-${attribute.ID}-${item.Primary_ID}`;
                        const groupName = `${idPrefix}-${attribute.ID}`;
                        const isSelected = selectedAttributes[attribute.Attribute_Name] === item.Item_Value;
                        const classes = isSelected
                            ? `cart-item-attribute-${attribute.Attribute_Name}-${item.ID}-selected`
                            : `cart-item-attribute-${attribute.Attribute_Name}-${item.ID}`;

                        if (attribute.Attribute_Type !== 'swatch') {
                            return (
                                <div key={item.Primary_ID}>
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        id={inputId}
                                        name={groupName}
                                        value={item.Item_Value}
                                        autoComplete="off"
                                        checked={isSelected}
                                        data-testid={classes}
                                        readOnly
                                    />
                                    <label className="btn btn-outline-primary" htmlFor={inputId}>
                                        {item.Display_Value}
                                    </label>
                                </div>
                            );
                        }

                        return (
                            <div key={item.Primary_ID} className="d-inline-block mr-1">
                                <input
                                    type="radio"
                                    id={item.Primary_ID}
                                    name={attribute.Attribute_Name}
                                    value={item.Item_Value}
                                    checked={isSelected}
                                    autoComplete="off"
                                    className="d-none"
                                    readOnly
                                />
                                <label
                                    htmlFor={item.Primary_ID}
                                    className="d-inline-block"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: item.Item_Value,
                                        border: isSelected ? "2px solid #27ae60" : "1px solid #ccc",
                                        cursor: "pointer"
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </>
    );
}