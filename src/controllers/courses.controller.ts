import { Request, Response } from 'express';
import courses from '../models/courses.prisma';
import { LEVELS } from '../types/courses.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const allCourses = await courses.findMany({
      orderBy: { id: 'asc' },
    });

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

      if (nameUrlAlreadyExist?.id !== id) {
        if (nameUrlAlreadyExist) {
          res.status(400).json({
            message: 'El nameUrl ingresado ya existe.',
          });
          return;
        }
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
    const rta = await courses.findMany({
      orderBy: { id: 'asc' },
    });

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

    const coursesRta = await courses.findMany({
      orderBy: { id: 'asc' },
    });
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

// Actualizar el orden de las clases
export const updateClassOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId, classOrders } = req.body;

  try {
    // Validar entrada
    if (!courseId || !Array.isArray(classOrders)) {
      res.status(400).json({
        message: 'courseId y classOrders son requeridos.',
      });
      return;
    }

    // Validar que todas las clases pertenecen al curso especificado
    const classIds = classOrders.map(
      (c: { id: number; classNumber: number }) => c.id
    );
    const classes = await prisma.classes.findMany({
      where: {
        id: { in: classIds },
        routeId: courseId,
      },
    });

    if (classes.length !== classOrders.length) {
      res.status(400).json({
        message: 'Algunas clases no pertenecen al curso especificado.',
      });
      return;
    }

    // Validamos si el total de clases a editar es el total de clases existentes del curso
    const allClasses = await prisma.classes.findMany({
      where: {
        routeId: courseId,
      },
    });

    if (allClasses.length !== classes.length) {
      res.status(400).json({
        message: 'Debes enviar el orden de todas las clases del curso.',
      });
      return;
    }

    // Validar que los classNumber sean únicos dentro del curso
    const classNumbers = classOrders.map(
      (c: { id: number; classNumber: number }) => c.classNumber
    );
    const uniqueClassNumbers = new Set(classNumbers);
    if (uniqueClassNumbers.size !== classNumbers.length) {
      res.status(400).json({
        message: 'Los classNumber deben ser únicos dentro del curso.',
      });
      return;
    }

    // Actualizar las clases en una transacción
    await prisma.$transaction(
      classOrders.map((classOrder: { id: number; classNumber: number }) =>
        prisma.classes.update({
          where: { id: classOrder.id },
          data: { classNumber: classOrder.classNumber },
        })
      )
    );

    const classesListRta = await prisma.classes.findMany({
      where: { routeId: Number(courseId) },
      orderBy: { classNumber: 'asc' },
    });

    res.status(200).json({
      message: 'Orden de clases actualizado exitosamente.',
      data: classesListRta,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Hubo un error al actualizar el orden de las clases.',
    });
  }
};
