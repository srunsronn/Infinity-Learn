
import Joi from "joi";

//validate register
export const validateUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
    role: Joi.string().valid("student", "teacher", "admin").optional().messages({
      "any.only": "Role must be one of ['student', 'teacher', 'admin']",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

// login validate
export const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};
