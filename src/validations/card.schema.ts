import { z } from "zod";

const cardScehamValidation = z.object({
  company_name: z
    .string()
    .min(3, { message: "Company Name Must Be More Then 3 Char" })
    .max(25, { message: "Company Name Must Be LEss Then 25 Char" })
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "Company Name must not contains special character"
    ),

  company_about: z
    .string()
    .min(10, { message: "Company About Must Be More Then 10 Char" })
    .max(250, { message: "Company About Be Less Then 25 Char" })
    .regex(/^[a-zA-Z0-9_]+$/, "Name must not contains special character"),

  company_socials: z.array(z.string()),
  template_Id: z.number().int(),

  isPublic: z.boolean(),
});

export { cardScehamValidation };
