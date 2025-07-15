import {AttributeComponentPropsType} from '../lib/types';

type Props = {
    attributeComponentProps: AttributeComponentPropsType;
}

export default function AttributeSwatch({ attributeComponentProps }: Props) {
    function handleClick() {
        if (attributeComponentProps.setInputState && !attributeComponentProps.isReadOnly) {
            attributeComponentProps.setInputState(attributeComponentProps.item_value);
        }
    }

    return (
        <button
            className={`swatch ${attributeComponentProps.isSelected ? 'swatch-selected' : ''}`}
            style={{ backgroundColor: attributeComponentProps.item_value }}
            id={attributeComponentProps.id}
            name={attributeComponentProps.name}
            onClick={handleClick}
        />
    );
}
