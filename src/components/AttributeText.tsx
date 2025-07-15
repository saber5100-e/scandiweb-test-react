import {AttributeComponentPropsType} from '../lib/types';

type Props = {
    attributeComponentProps: AttributeComponentPropsType;
};

export default function AttributeText({ attributeComponentProps }: Props) {
    function handleClick(){
        if(attributeComponentProps.setInputState && !attributeComponentProps.isReadOnly){
            attributeComponentProps.setInputState(attributeComponentProps.item_value)
        }
    }

    return (
            <button
                className={`btn ${attributeComponentProps.isSelected ? 'btn-selected' : ''}`}
                id={attributeComponentProps.id}
                name={attributeComponentProps.name}
                onClick={handleClick}
            >
                {attributeComponentProps.item_value}
            </button>
    );
}