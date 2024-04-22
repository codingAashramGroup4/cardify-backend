import { z } from "zod";

const userSchemaValidation = z.object({
  username: z
    .string()
    .min(3, { message: "Username Must Be Atleast 3 charcters" })
    .max(25, { message: "Username Must Be Less Then 25 Characters" })
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contains special character"),
  email: z.string().email({ message: "Invalid Email Address" }),
  password: z
    .string()
    .min(5, { message: "Password must  be more then 5 character" })
    .max(10, { message: "Password can be max of 10 charcters" }),

  about: z
    .string()
    .max(100, { message: "Password can be max of 10 charcters" })
    .optional(),

  socialMedia: z.array(z.string()).optional(),
  profile_bg_color: z.string().optional(),
});

export { userSchemaValidation };
