import { Schema } from "@/types";

export const ordersSchema: Schema = {
  name: "orders",
  fields: [
    { name: "orderId", type: "string", label: "Order ID" },
    { name: "customerName", type: "string", label: "Customer" },
    { name: "total", type: "number", label: "Total (USD)" },
    {
      name: "status",
      type: "enum",
      label: "Status",
      options: ["pending", "shipped", "delivered", "cancelled"],
    },
    { name: "itemCount", type: "number", label: "Items" },
    { name: "orderDate", type: "date", label: "Order Date" },
    { name: "priority", type: "boolean", label: "Priority" },
  ],
};
