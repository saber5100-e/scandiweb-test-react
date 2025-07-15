export type ProductAttributeType = {
  id: string;
  primary_id: string;
  attribute_name: string;
  attribute_type: 'swatch' | 'text';
  attributes_items: {
    primary_id: string;
    id: string;
    attribute_id: string;
    display_value: string;
    item_value: string;
  }[];
};

export type CartItemType = {
  id: string;
  product_name: string;
  quantity: number;
  amount: number;
  symbol: string;
  image: string;
  attributes: { [key: string]: string };
}


export type ProductDetailsType = {
  id: string;
  products_attributes: ProductAttributeType[];
}

export type SelectedAttributesType = {
    [attributeName: string]: string;
};

export type ProductType = {
  id: string;
  product_name: string;
  in_stock: boolean;
  description: string;
  category: string;
  brand: string;
  products_gallery: {
    id: string;
    product_id: string;
    url: string;
  }[];
  products_attributes: ProductAttributeType[];
  product_prices: {
    currency: {
      label: string;
      symbol: string;
    }
    amount: number;
  }[];
}

export type ImageType = {
  id: string;
  url: string;
};

export type QuickShopProductType = Omit<ProductType, "Product_Prices"> & {
  products_attributes: ProductAttributeType[];
  product_prices: {
    amount: number;
    currency: {
      symbol: string;
    }
  }[];
};

export type AttributeSelectionsType = Record<string, string>;

export type CategoriesType = {
  id: string;
  category_name: string;
}[];

export type ItemsType = CartItemType[];

export type ErrorContextType = {
  msg: string;
  setMsg: (msg: string) => void;
  isError: boolean;
  setIsError: (error: boolean) => void
}

export type CategoryContextType = {
  setCurrentCategory: (currentCategory: string) => void;
  currentCategory: string
}

export type CartContextType = {
  totalPrice: number;
  setTotalPrice: (totalPrice: number) => void;
  cartItemsState: CartItemType[];
  setCartItemsState: (items: CartItemType[]) => void;
}

export type AttributeComponentPropsType = {
  setInputState: React.Dispatch<React.SetStateAction<string>> | null;
  dataTestId: string | null;
  id: string;
  isSelected: boolean;
  name: string;
  display_value: string;
  item_value: string;
  isReadOnly: boolean;
};