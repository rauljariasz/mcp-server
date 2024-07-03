import express from 'express';
import { authenticatedReq } from '../middlewares/auth.handler';
import { isAdmin } from '../middlewares/admin.handler';
import {
  editUserRole,
  getTotalUsers,
  getUser,
} from '../controllers/admin.controller';
import {
  createCourse,
  deleteCourse,
  editCourse,
  updateClassOrder,
} from '../controllers/courses.controller';
import {
  createClass,
  deleteClass,
  editClass,
} from '../controllers/classes.controller';

const router = express.Router();

router.get('/getUser', authenticatedReq, isAdmin, getUser);
router.put('/editUserRole', authenticatedReq, isAdmin, editUserRole);
router.get('/getTotalUsers', authenticatedReq, isAdmin, getTotalUsers);
// CRUD cursos
router.post('/createCourse', authenticatedReq, isAdmin, createCourse);
router.put('/editCourse', authenticatedReq, isAdmin, editCourse);
router.delete('/deleteCourse', authenticatedReq, isAdmin, deleteCourse);
router.post('/updateClassOrder', authenticatedReq, isAdmin, updateClassOrder);
// CRUD clases
router.post('/createClass', authenticatedReq, isAdmin, createClass);
router.put('/editClass', authenticatedReq, isAdmin, editClass);
router.delete('/deleteClass', authenticatedReq, isAdmin, deleteClass);

export default router;
