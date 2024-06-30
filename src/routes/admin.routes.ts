import express from 'express';
import { authenticatedReq } from '../middlewares/auth.handler';
import { isAdmin } from '../middlewares/admin.handler';
import { editUserRole, getUser } from '../controllers/admin.controller';
import { createCourse } from '../controllers/courses.controller';

const router = express.Router();

router.get('/getUser', authenticatedReq, isAdmin, getUser);
router.put('/editUserRole', authenticatedReq, isAdmin, editUserRole);
router.post('/createCourse', authenticatedReq, isAdmin, createCourse);

export default router;
