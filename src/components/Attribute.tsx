import { useEffect, useState } from "react";
import AttributeText from "./AttributeText";
import AttributeSwatch from "./AttributeSwatch";
import kebabize from "../lib/kebabize";
import type { ProductAttributeType } from '../lib/types';

type Props = {
  attribute: ProductAttributeType;
  setAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export default function Attribute({ attribute, setAttributes }: Props) {
  const [inputState, setInputState] = useState<string>("");

  useEffect(() => {
    setAttributes(prev => ({
      ...prev,
      [attribute.Attribute_Name]: inputState
    }));
  }, [inputState, attribute.Attribute_Name, setAttributes]);

  return (
    <div data-testid={`product-attribute-${kebabize(attribute.Attribute_Name)}`}>
      <h1>{attribute.Attribute_Name}</h1>
      <div className="btn-group mb-3" role="group" aria-label="Basic radio toggle button group">
        {attribute.Attributes_Items.map(item => {
          return attribute.Attribute_Type === 'swatch' ? (
            <AttributeSwatch
              key={item.Primary_ID}
              item={item}
              attribute={attribute}
              setInputState={setInputState}
              inputState={inputState}
            />
          ) : (
            <AttributeText
              key={item.Primary_ID}
              item={item}
              attribute={attribute}
              setInputState={setInputState}
              inputState={inputState}
            />
          );
        })}
      </div>
    </div>
  );
}