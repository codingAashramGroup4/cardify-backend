import { z } from "zod";

const appointmentScehamValidation = z.object({
  name: z
    .string()
    .min(3, { message: " Name Must Be More Then 3 Char" })
    .max(25, { message: " Name Must Be LEss Then 25 Char" })
    .regex(/^[a-zA-Z0-9_ ]+$/, " Name must not contains special character"),

  description: z
    .string()
    .min(10, { message: "Description Must Be More Then 10 Char" })
    .max(250, { message: "Description Should Be Less Then 25 Char" })
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Description must not contains special character"
    ),

  appointment_date_time: z.date(),

  meet_link: z.string(),
});

export { appointmentScehamValidation };
