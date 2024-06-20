import express from 'express';
import { authenticatedReq } from '../middlewares/auth.handler';
import {
  editEmail,
  editProfile,
  getDataUser,
} from '../controllers/client.controller';

const router = express.Router();

router.get('/getDataUser', authenticatedReq, getDataUser);
router.put('/editProfile', authenticatedReq, editProfile);
router.put('/editEmail', authenticatedReq, editEmail);

export default router;
