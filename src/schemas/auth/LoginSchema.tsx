import * as yup from "yup";

const emailValidationRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginSchema = yup.object({
  email: yup
    .string()
    .matches(emailValidationRegex, "email must be a valid email")
    .email("email must be a valid")
    .required("email is required"),

  password: yup
    .string()
    .min(8, "password must be 8 or more characters")
    .max(25, "password must contain 25 ot less charachters")
    .required("password is required"),
});
