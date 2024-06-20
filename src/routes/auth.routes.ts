import express from 'express';
import {
  forgotPassword,
  login,
  recoveryPassword,
  register,
  resendCode,
  verify,
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/recoveryPassword', recoveryPassword);
router.post('/resendCode', resendCode);

export default router;
