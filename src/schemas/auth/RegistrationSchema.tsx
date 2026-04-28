import * as yup from "yup";

const emailValidationRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password must contain at least one uppercase, one lowercase, one number, and one special character
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required("Enter your first name")
    .min(4, "must be 4 or more characters"),

  lastName: yup
    .string()
    .required("Enter your last name")
    .min(4, "must be 4 or more characters"),

  email: yup
    .string()
    .matches(emailValidationRegex, "email must be a valid email")
    // .email("email must be a valid email")
    .required("Enter your email"),

  password: yup
    .string()
    .required("password is required")
    .min(8, "Minimum 8 characters required")
    .max(128, "password must contain 128 or less characters")
    .matches(
      strongPasswordRegex,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)"
    ),

  repeatPassword: yup
    .string()
    .required("Re-enter your password")
    .min(8, "must be 8 or more characters")
    .max(128, "password must contain 128 or less characters")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
