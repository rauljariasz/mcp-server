import { Request, Response } from 'express';
import courses from '../models/courses.prisma';
import { LEVELS } from '../types/courses.interface';

// Crear un nuevo curso
export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, level, nameUrl, imageUrl } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!title || !description || !level || !nameUrl) {
      res.status(400).json({
        message:
          'Titulo, descripción, level, nombre url son requeridos en esta petición.',
      });
      return;
    }

    // Verificamos si ya existe algun curso con este nameUrl
    const alreadyExist = await courses.findUnique({
      where: { nameUrl },
    });

    if (alreadyExist) {
      res.status(400).json({
        message: 'Porfavor escoge otro nameUrl',
      });
      return;
    }

    // Verificamos que el level recibido sea valido
    if (!Object.values(LEVELS).includes(level)) {
      res.status(400).json({
        message: 'El nivel ingresado no es valido.',
      });
      return;
    }

    await courses.create({
      data: {
        title,
        description,
        level,
        nameUrl,
        imageUrl,
      },
    });

    const allCourses = await courses.findMany();

    res.status(201).json({
      data: allCourses,
    });
  } catch (error) {}
};
