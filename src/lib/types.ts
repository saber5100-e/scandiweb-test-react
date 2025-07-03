export type ItemType = {
  Primary_ID: string;
  ID: string;
  Attribute_ID: string;
  Display_Value: string;
  Item_Value: string;
};

export type AttributeType = {
    Attribute_Name: string,
}

export type AttributeItemType = {
  Primary_ID: string;
  ID: string;
  Attribute_ID: string;
  Display_Value: string;
  Item_Value: string;
};

export type ProductAttributeType = {
  ID: string;
  Primary_ID: string;
  Attribute_Name: string;
  Attribute_Type: 'swatch' | 'text';
  Attributes_Items: AttributeItemType[];
};

export type CartItemType = {
  id: string;
  Product_Name: string;
  quantity: number;
  Amount: number;
  Symbol: string;
  Image: string;
  attributes: { [key: string]: string };
}


export type ProductDetailsType = {
  ID: string;
  Products_Attributes: ProductAttributeType[];
}

export type SelectedAttributesType = {
    [attributeName: string]: string;
};

export type ProductsGalleryType = {
  ID: string;
  Product_ID: string;
  URL: string;
}

export type ProductPriceType = {
  Currency_Label: string;
  Currency_Symbol: string;
  Amount: number;
};


export type ProductType = {
  ID: string;
  Product_Name: string;
  In_Stock: boolean;
  Description: string;
  Category: string;
  Brand: string;
  Products_gallery: ProductGalleryType[];
  Products_Attributes: ProductAttributeType[];
  Product_Prices: ProductPriceType[];
}

export type ProductAttribute = {
  ID: string;
  Product_ID: string;
  Attribute_Name: string;
  Attributes_Items: {
      Attribute_ID: string;
      Item_Value: string;
  }[];
}

export type ImageType = {
  ID: string;
  URL: string;
};

export type QuickShopProductType = Omit<ProductType, "Product_Prices"> & {
  Products_Attributes: ProductAttributeType[];
  Product_Prices: {
    Amount: number;
    Currency_Symbol: string;
  }[];
};

export type ProductGalleryType = {
  ID: string;
  Product_ID: string;
  URL: string;
};

export type AttributeSelectionsType = Record<string, string>;

export type CategoryType = {
  ID: string;
  Category_Name: string;
}

export type CategoriesType = CategoryType[];
export type ItemsType = CartItemType[];

export type ErrorContextType = {
  msg: string,
  setMsg: (msg: string) => void,
  isError: boolean,
  setIsError: (error: boolean) => void
}

export type CategoryContextType = {
  setCurrentCategory: (currentCategory: string) => void;
  currentCategory: string
}

export type CartContextType = {
  totalPrice: number,
  setTotalPrice: (totalPrice: number) => void;
  cartItemsState: CartItemType[];
  setCartItemsState: (items: CartItemType[]) => void;
}