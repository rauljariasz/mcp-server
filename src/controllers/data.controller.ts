import { Request, Response } from 'express';
import courses from '../models/courses.prisma';
import classes from '../models/classes.prisma';

// Obtener la lista de cursos
export const getCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const coursesList = await courses.findMany({
      orderBy: { id: 'asc' },
    });
    if (coursesList) {
      res.status(200).json({
        data: coursesList,
      });
    } else {
      res.status(200).json({
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};

// Obtener la lista de clases de 1 curso.
export const getClasses = async (req: Request, res: Response) => {
  const { routeId } = req.params;

  try {
    const classesList = await classes.findMany({
      where: { routeId: Number(routeId) },
      orderBy: { classNumber: 'asc' },
    });

    if (classesList) {
      res.status(200).json({
        data: classesList,
      });
    } else {
      res.status(200).json({
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};
