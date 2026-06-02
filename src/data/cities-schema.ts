import { Schema } from "@/types";

export const citiesSchema: Schema = {
  name: "cities",
  fields: [
    { name: "cityName", type: "string", label: "City" },
    { name: "country", type: "string", label: "Country" },
    { name: "population", type: "number", label: "Population" },
    {
      name: "continent",
      type: "enum",
      label: "Continent",
      options: [
        "Africa",
        "Asia",
        "Europe",
        "North America",
        "South America",
        "Oceania",
      ],
    },
    { name: "isCoastal", type: "boolean", label: "Coastal City" },
    { name: "foundedYear", type: "number", label: "Founded Year" },
  ],
};
