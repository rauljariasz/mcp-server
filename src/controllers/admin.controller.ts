import { Request, Response } from 'express';
import users from '../models/user.prisma';
import { ROLES } from '../types/user.interface';

// Obtener un usuario mediante correo electronico
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!email) {
      res.status(400).json({
        message: 'Email es requerido para esta petición.',
      });
      return;
    }

    const user = await users.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        message: 'No existe usuario con este correo electronico.',
      });
    } else {
      const { email, role } = user;

      // Si todo esta OK, respondemos unicamente correo y rol del usuario
      res.status(200).json({
        data: {
          email,
          role,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};

// Editar el rol de un usuario
export const editUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, role } = req.body;

  try {
    // *--------------* //
    // Prevalidaciones //
    // *------------* //
    if (!email || !role) {
      res.status(400).json({
        message: 'Correo y rol son requeridos para esta petición.',
      });
      return;
    }

    // Si el role recibido no es uno valido respondemos 400
    if (!Object.values(ROLES).includes(role)) {
      res.status(400).json({
        message: 'El rol ingresado no es valido.',
      });
      return;
    }

    const user = await users.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        message: 'No existe usuario con este correo electronico.',
      });
      return;
    }

    await users.update({
      where: { email },
      data: {
        role: role,
      },
    });

    res.status(200).json({
      data: {
        email,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};
