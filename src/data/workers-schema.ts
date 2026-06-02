import { Schema } from "@/types";

export const workersSchema: Schema = {
  name: "workers",
  fields: [
    { name: "fullName", type: "string", label: "Full Name" },
    {
      name: "department",
      type: "enum",
      label: "Department",
      options: ["Engineering", "Sales", "Marketing", "HR", "Finance"],
    },
    { name: "salary", type: "number", label: "Salary" },
    { name: "yearsOfExperience", type: "number", label: "Experience (Years)" },
    { name: "remoteWorker", type: "boolean", label: "Remote Worker" },
    { name: "hireDate", type: "date", label: "Hire Date" },
    { name: "title", type: "string", label: "Job Title" },
  ],
};
