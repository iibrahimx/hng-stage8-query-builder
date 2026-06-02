import { Schema } from "@/types";

export const productsSchema: Schema = {
  name: "products",
  fields: [
    { name: "productName", type: "string", label: "Product Name" },
    {
      name: "category",
      type: "enum",
      label: "Category",
      options: ["Electronics", "Clothing", "Food", "Books", "Sports"],
    },
    { name: "price", type: "number", label: "Price (USD)" },
    { name: "stock", type: "number", label: "Stock" },
    { name: "rating", type: "number", label: "Rating" },
    { name: "onSale", type: "boolean", label: "On Sale" },
    { name: "releaseDate", type: "date", label: "Release Date" },
    { name: "brand", type: "string", label: "Brand" },
  ],
};
