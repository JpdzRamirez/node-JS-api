import { body, param } from "express-validator";

//************************************************************************** */

// ✅ Validación para crear usuario
export const validateCreateUser = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("El email no es válido")
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("El email no debe contener espacios en blanco");
      }
      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
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

  body("name")
    .isString()
    .notEmpty()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El nombre es obligatorio"),

  body("lastname")
    .optional()
    .isString()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El apellido solo debe contener letras y espacios"),

  body("document")
    .trim()
    .isNumeric()
    .withMessage("El documento debe ser un número")
    .custom((value) => {
      if (!/^\d+$/.test(value)) {
        throw new Error("El documento solo debe contener números");
      }
      return true;
    })
    .notEmpty()
    .withMessage("El documento no puede estar vacío"),

    body("document")
    .trim()
    .isNumeric()
    .withMessage("El esquema debe ser un número")
    .custom((value) => {
      if (!/^\d+$/.test(value)) {
        throw new Error("El esquema solo debe contener números");
      }
      return true;
    })
    .notEmpty()
    .withMessage("El esquema debe ser específicado, no puede estar vacío"),

  body("phone")
    .optional()
    .trim()
    .isString()
    .withMessage("El teléfono debe ser una cadena de texto"),

  body("address")
    .optional()
    .isString()
    .withMessage("La dirección debe ser una cadena de texto"),


  body("mobile").trim().isString().notEmpty().withMessage("El móvil es obligatorio"),

  body("role_id")
    .trim()
    .optional()
    .isInt({ min: 1 })
    .withMessage("El rol debe ser un número entero positivo"),
];

//************************************************************************** */

// ✅ Validación para actualizar usuario
export const validateUpdateUser = [
  param("id").isUUID().withMessage("El ID es requerido"),
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
  body("lastname")
    .optional()
    .isString()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El apellido solo debe contener letras y espacios"),
  body("document")
    .isNumeric()
    .withMessage("El documento debe ser un número")
    .custom((value) => {
      if (!/^\d+$/.test(value)) {
        throw new Error("El documento solo debe contener números");
      }
      return true;
    })
    .notEmpty()
    .withMessage("El documento no puede estar vacío"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\d+$/)
    .withMessage("El telefono debe ser una cadena de texto"),
  body("mobile")
    .optional()
    .isString()
    .matches(/^\d+$/)
    .withMessage("El movil es obligatorio"),
  body("address")
    .optional()
    .isString()
    .withMessage("El address es obligatorio"),
  // ✅ Validar el rol si se envía
  body("role")
    .optional()
    .trim()
    .isIn(["user", "admin", "guest"])
    .withMessage("Rol inválido"),
];

//************************************************************************** */

// ✅ Validación para obtener usuario por ID
export const validateGetUser = [
  param("id").isUUID().withMessage("El ID es requerido"),
];

// ✅ Validación para obtener usuario por emails
export const validateLoginUser = [
  body("email").isEmail().trim().withMessage("El email proporcionado no es válido"),
  body("password").notEmpty().trim().withMessage("La contraseña no fué proporcionada"),
];

//************************************************************************** */

// ✅ Validación para obtener usuario por emails
export const validateGetUserByEmail = [
  body("email").isEmail().trim().withMessage("El email proporcionado no es válido"),
];

//************************************************************************** */

// ✅ Validación para eliminar usuario
export const validateDeleteUser = [
  param("id").isUUID().withMessage("El ID es requerido"),
];
