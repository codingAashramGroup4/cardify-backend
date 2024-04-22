import { z } from "zod";

const messageScehamValidation = z.object({
  name: z
    .string()
    .min(3, { message: "Name Must Be More Then 3 Char" })
    .max(25, { message: "Name Must Be LEss Then 25 Char" })
    .regex(/^[a-zA-Z0-9_]+$/, "Name must not contains special character"),

  message: z
    .string()
    .min(10, { message: "Message Must Be More Then 10 Char" })
    .max(250, { message: "Message Must Be Less Then 25 Char" })
    .regex(/^[a-zA-Z0-9_]+$/, "Name must not contains special character"),
});

export { messageScehamValidation };
