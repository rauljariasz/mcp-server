import express from 'express';
import { getClasses, getCourses } from '../controllers/data.controller';

const router = express.Router();

router.get('/getCourses', getCourses);
router.get('/getClasses/:routeId', getClasses);

export default router;
