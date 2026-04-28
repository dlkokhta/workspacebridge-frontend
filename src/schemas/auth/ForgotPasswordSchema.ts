import * as yup from "yup";

const emailValidationRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .matches(emailValidationRegex, "Email must be a valid email")
    .required("Email is required"),
});
