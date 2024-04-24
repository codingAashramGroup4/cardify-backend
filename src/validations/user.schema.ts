import { z } from "zod";

const singUpSchemaValidation = z.object({
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

const userSchemaValidation = z.object({
  username: z
    .string()
    .min(3, { message: "Username Must Be Atleast 3 charcters" })
    .max(25, { message: "Username Must Be Less Then 25 Characters" })
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contains special character")
    .optional(),
  email: z.string().email({ message: "Invalid Email Address" }),
  password: z
    .string()
    .min(5, { message: "Password must  be more then 5 character" })
    .max(10, { message: "Password can be max of 10 charcters" }),
});

const verifyOtpSchemaValidation = z.object({
  verifyCode: z
    .string()
    .length(6, { message: "Verification Code Must Be  6 Digit" })
    .optional(),
  username: z
    .string()
    .min(3, { message: "Username Must Be Atleast 3 charcters" })
    .max(25, { message: "Username Must Be Less Then 25 Characters" })
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contains special character")
    .optional(),
  forgotPassword: z.boolean(),
});

const updateUserSchemaValidation = z.object({
  about: z
    .string()
    .max(100, { message: "Password can be max of 10 charcters" })
    .optional(),

  socialMedia: z.array(z.string()).optional(),
});

const forgatePasswordSchemaValidation = z.object({
  email: z.string().email({ message: "Invalid Email Address" }).optional(),

  oldPassword: z
    .string()
    .min(5, { message: "Password must  be more then 5 character" })
    .max(10, { message: "Password can be max of 10 charcters" })
    .optional(),

  newPassword: z
    .string()
    .min(5, { message: "Password must  be more then 5 character" })
    .max(10, { message: "Password can be max of 10 charcters" })
    .optional(),
});
export {
  singUpSchemaValidation,
  userSchemaValidation,
  verifyOtpSchemaValidation,
  updateUserSchemaValidation,
  forgatePasswordSchemaValidation,
};
