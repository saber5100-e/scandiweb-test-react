import { useEffect, useState } from "react";

import kebabize from "../lib/kebabize";

import AttributeText from "./AttributeText";
import AttributeSwatch from "./AttributeSwatch";

import type { AttributeComponentPropsType, ProductAttributeType } from '../lib/types';

type Props = {
  attribute: ProductAttributeType;
  setAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>> | null;
};

export default function Attribute({ attribute, setAttributes }: Props) {
  const [inputState, setInputState] = useState<string>("");

  useEffect(() => {
    if(setAttributes){
      setAttributes(prev => ({
      ...prev,
      [attribute.attribute_name]: inputState
      }));
    }
    
  }, [inputState, attribute.attribute_name, setAttributes]);

  return (
    <>
    {attribute.attributes_items.map(item => {
        const attributeComponentProps: AttributeComponentPropsType = {
          isReadOnly: false,
          name: attribute.attribute_name,
          isSelected: inputState === item.item_value,
          id: String(item.primary_id),
          dataTestId: null,
          display_value: item.display_value,
          item_value: item.item_value,
          setInputState: setInputState
        }

        const Attr = attribute.attribute_type === 'swatch'
            ? <AttributeSwatch key={item.primary_id} attributeComponentProps={attributeComponentProps} />
            : <AttributeText key={item.primary_id} attributeComponentProps={attributeComponentProps} />;

        
          return (
            <div
              key={`${attribute.attribute_name}-${item.display_value}`}
              data-testid={`product-attribute-${kebabize(attribute.attribute_name)}-${item.display_value}`}
            >
              {Attr}
            </div>
          )
        })}
    </>
        

  );
}