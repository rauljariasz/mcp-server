import express from 'express';
import { authenticatedReq } from '../middlewares/auth.handler';
import {
  editEmail,
  editPassword,
  editProfile,
  getDataUser,
  markClassAsViewed,
} from '../controllers/client.controller';

const router = express.Router();

router.get('/getDataUser', authenticatedReq, getDataUser);
router.put('/editProfile', authenticatedReq, editProfile);
router.put('/editEmail', authenticatedReq, editEmail);
router.put('/editPassword', authenticatedReq, editPassword);
router.put('/markClassAsViewed', authenticatedReq, markClassAsViewed);

export default router;
