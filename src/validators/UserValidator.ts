import { body, param } from "express-validator";

//************************************************************************** */

// ✅ Validación para crear usuario
export const validateCreateUser = [
  // ✅ Validar email (sin espacios, formato correcto)
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("El email no debe contener espacios en blanco");
      }
      return true;
    }),

  // ✅ Validar contraseña (mínimo 6 caracteres, al menos 1 número, 1 mayúscula y 1 carácter especial)
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe contener al menos una letra mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número")
    .matches(/[@$!%*?&]/)
    .withMessage(
      "La contraseña debe contener al menos un carácter especial (@$!%*?&)"
    )
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("La contraseña no debe contener espacios en blanco");
      }
      return true;
    }),

  // ✅ Validar el rol (solo "user" o "admin")
  body("role").isIn(["user", "admin"]).withMessage("Rol inválido"),
];

//************************************************************************** */

// ✅ Validación para actualizar usuario
export const validateUpdateUser = [
  // ✅ Validar email si se envía (sin espacios, formato correcto)
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("El email no debe contener espacios en blanco");
      }
      return true;
    }),

  // ✅ Validar contraseña si se envía (mínimo 6 caracteres, 1 mayúscula, 1 número, 1 especial)
  body("password")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe contener al menos una letra mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número")
    .matches(/[@$!%*?&]/)
    .withMessage(
      "La contraseña debe contener al menos un carácter especial (@$!%*?&)"
    )
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("La contraseña no debe contener espacios en blanco");
      }
      return true;
    }),

  // ✅ Validar el rol si se envía
  body("role").optional().isIn(["user", "admin"]).withMessage("Rol inválido"),
];

//************************************************************************** */

// ✅ Validación para obtener usuario por ID
export const validateGetUser = [
  param("id").isUUID().withMessage("El ID no existe en los registros"),
];

//************************************************************************** */

// ✅ Validación para obtener usuario por emails
export const validateGetUserByEmail = [
  body("email").isEmail().withMessage("El email proporcionado no es válido"),
];

//************************************************************************** */

// ✅ Validación para eliminar usuario
export const validateDeleteUser = [
  param("id").isUUID().withMessage("El ID debe no coincide en los registros"),
];
