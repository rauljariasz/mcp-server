import { Request, Response } from 'express';
import classes from '../models/classes.prisma';
import courses from '../models/courses.prisma';
import { ROLES } from '../types/user.interface';

// Crear una nueva clase
export const createClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, role, routeId, videoUrl } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!title || !description || !role || !routeId || !videoUrl) {
      res.status(400).json({
        message:
          'Titulo, descripción, rol, numero de clase, ID de la ruta y Url de video son requeridos en esta petición.',
      });
      return;
    }

    // Verificamos que el level recibido sea valido
    if (!Object.values(ROLES).includes(role)) {
      res.status(400).json({
        message: 'El rol ingresado no es valido.',
      });
      return;
    }

    // Validamos que el curso exista
    const courseExist = await courses.findUnique({
      where: { id: routeId },
    });

    if (!courseExist) {
      res.status(400).json({
        message: 'El curso no existe.',
      });
      return;
    }

    // Validamos que la nueva clase no tenga classNumber repetido
    const classesToCheck = await classes.findMany({
      where: { routeId },
      orderBy: { classNumber: 'desc' },
    });

    const lastClass = classesToCheck.length ? classesToCheck[0].classNumber : 0;

    await classes.create({
      data: {
        title,
        description,
        role,
        classNumber: lastClass + 1,
        routeId,
        videoUrl,
      },
    });

    const classesList = await classes.findMany({
      where: { routeId },
      orderBy: { classNumber: 'asc' },
    });

    res.status(201).json({
      message: 'Clase creada exitosamente.',
      data: classesList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la verificación.',
    });
  }
};

// Editar Clase
export const editClass = async (req: Request, res: Response): Promise<void> => {
  const { id, title, description, role, videoUrl } = req.body;

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

    // Verificamos que el level recibido sea valido
    if (!Object.values(ROLES).includes(role)) {
      res.status(400).json({
        message: 'El rol ingresado no es valido.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //
    const classToEdit = await classes.findUnique({
      where: { id },
    });

    if (!classToEdit) {
      res.status(400).json({
        message: 'No existe una clase con este ID.',
      });
      return;
    }

    await classes.update({
      where: { id },
      data: {
        title: title || classToEdit?.title,
        description: description || classToEdit?.description,
        role: role || classToEdit?.role,
        videoUrl: videoUrl || classToEdit?.videoUrl,
      },
    });

    // Retornamos la lista de clases directamente para que en el front actualicen los estados
    const classesListRta = await classes.findMany({
      where: { routeId: classToEdit.routeId },
      orderBy: { classNumber: 'asc' },
    });

    res.status(200).json({
      message: 'Clase editada correctamente.',
      data: classesListRta,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la petición.',
    });
  }
};

// Eliminar una clase
export const deleteClass = async (
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
    const classToDelete = await classes.findUnique({
      where: { id },
    });

    if (!classToDelete) {
      res.status(400).json({
        message: 'No existe una clase con este ID.',
      });
      return;
    }

    await classes.delete({
      where: { id },
    });

    // Retornamos la lista de clases directamente para que en el front actualicen los estados
    const classesListRta = await classes.findMany({
      where: { routeId: classToDelete.routeId },
      orderBy: { classNumber: 'asc' },
    });
    res.status(200).json({
      message: 'Clase eliminada correctamente.',
      data: classesListRta,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en la petición.',
    });
  }
};
