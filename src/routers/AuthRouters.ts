import { Router} from "express";
import { AuthController } from "../controllers/AuthController";

import { handleValidationErrors } from '../middleware/HandleValidationErrors';

import { 
  validateLoginUser,
  validateCreateUser
 } from "../validators/UserValidator";

const router = Router();


router.post('/register',validateCreateUser ,handleValidationErrors,AuthController.register.bind(AuthController) );

router.post('/login', validateLoginUser, handleValidationErrors, AuthController.login.bind(AuthController));



export default router;
