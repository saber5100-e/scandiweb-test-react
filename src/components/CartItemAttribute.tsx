import { useId } from 'react';

import kebabize from '../lib/kebabize';
import {SelectedAttributesType, ProductAttributeType, AttributeComponentPropsType} from '../lib/types';

import AttributeText from './AttributeText';
import AttributeSwatch from './AttributeSwatch';

type Props = {
    product_attributes: ProductAttributeType[];
    selectedAttributes: SelectedAttributesType;
};

export default function CartItemAttribute({ product_attributes, selectedAttributes }: Props) {
    const idPrefix = useId();

    return (
        <>
            {product_attributes.map(attribute => (
                <div className='product-option' data-testid={`cart-item-attribute-${kebabize(attribute.attribute_name)}`} key={attribute.id}>
                    <label>{attribute.attribute_name}:</label>

                    <div className='btns'>
                        {attribute.attributes_items.map(item => {
                            const inputId = `${idPrefix}-${attribute.id}-${item.primary_id}`;
                            const groupName = `${idPrefix}-${attribute.id}`;
                            const isSelected = selectedAttributes[attribute.attribute_name] === item.item_value;
                            const classes = isSelected
                                ? `cart-item-attribute-${attribute.attribute_name}-${item.id}-selected`
                                : `cart-item-attribute-${attribute.attribute_name}-${item.id}`;

                            const attributeComponentProps: AttributeComponentPropsType = {
                                isReadOnly: true,
                                item_value: item.item_value,
                                display_value: item.display_value,
                                name: groupName,
                                isSelected: isSelected,
                                id: inputId,
                                dataTestId: classes,
                                setInputState: null
                            }

                            if (attribute.attribute_type !== 'swatch') {
                                return (
                                    <AttributeText key={item.primary_id} attributeComponentProps={attributeComponentProps}/>
                                );
                            }

                            return (
                                <AttributeSwatch key={item.primary_id} attributeComponentProps={attributeComponentProps}/>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
}