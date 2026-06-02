import { Schema } from "@/types";

// First schema - a "Users" dataset
export const usersSchema: Schema = {
  name: "users",
  fields: [
    {
      name: "firstName",
      type: "string",
      label: "First Name",
    },
    {
      name: "lastName",
      type: "string",
      label: "Last Name",
    },
    {
      name: "age",
      type: "number",
      label: "Age",
    },
    {
      name: "email",
      type: "string",
      label: "Email",
    },
    {
      name: "country",
      type: "enum",
      label: "Country",
      options: [
        "Nigeria",
        "Ghana",
        "Russia",
        "China",
        "Kenya",
        "South Africa",
        "United States",
        "United Kingdom",
        "Japan",
        "South Korea",
        "Malaysia",
      ],
    },
    {
      name: "status",
      type: "enum",
      label: "Status",
      options: ["active", "inactive", "suspended"],
    },
    {
      name: "purchases",
      type: "number",
      label: "Total Purchases",
    },
    {
      name: "lastLogin",
      type: "date",
      label: "Last Login",
    },
    {
      name: "verified",
      type: "boolean",
      label: "Verified",
    },
  ],
};
