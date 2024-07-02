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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la petición.',
    });
  }
};

// Editar curso
export const editCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, title, description, level, nameUrl, imageUrl } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!id) {
      res.status(400).json({
        message: 'El id es necesario para esta petición',
      });
      return;
    }

    // Validamos si se quiere cambiar el nameUrl
    if (nameUrl) {
      const nameUrlAlreadyExist = await courses.findUnique({
        where: { nameUrl },
      });

      if (nameUrlAlreadyExist) {
        res.status(400).json({
          message: 'El nameUrl ingresado ya existe.',
        });
        return;
      }
    }

    // Verificamos que el level recibido sea valido
    if (!Object.values(LEVELS).includes(level)) {
      res.status(400).json({
        message: 'El nivel ingresado no es valido.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //
    const courseToEdit = await courses.findUnique({
      where: { id },
    });

    if (!courseToEdit) {
      res.status(400).json({
        message: 'No existe un curso con este ID.',
      });
      return;
    }

    await courses.update({
      where: { id },
      data: {
        title: title || courseToEdit?.title,
        description: description || courseToEdit?.description,
        level: level || courseToEdit?.level,
        nameUrl: nameUrl || courseToEdit?.nameUrl,
        imageUrl: imageUrl || courseToEdit?.imageUrl,
      },
    });

    // Respondemos con la lista de cursos para que en el front actualicen el estado de los cursos
    const rta = await courses.findMany();

    res.status(200).json({
      message: 'Curso editado correctamente.',
      data: rta,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la petición.',
    });
  }
};

// Eliminar curso
export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!id) {
      res.status(400).json({
        message: 'El id es necesario para esta petición',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //
    const courseToDelete = await courses.findUnique({
      where: { id },
    });

    if (!courseToDelete) {
      res.status(400).json({
        message: 'No existe un curso con este ID.',
      });
      return;
    }

    await courses.delete({
      where: { id },
    });

    const coursesRta = await courses.findMany();
    res.status(200).json({
      message: 'Curso eliminado correctamente.',
      data: coursesRta,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la petición.',
    });
  }
};
