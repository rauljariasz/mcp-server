import { NextFunction, Request, Response } from 'express';
import users from '../models/user.prisma';
import { ROLES } from '../types/user.interface';

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body?.token;

  try {
    const user = await users.findUnique({
      where: { id },
    });

    // Si no existe el usuario, responde con error.
    if (!user) {
      res.status(404).json({
        message: 'Usuario no encontrado',
      });
      return;
    }

    if (user.role === ROLES.ADMIN) {
      next();
    } else {
      res.status(401).json({
        message: 'No eres un usuario administrador',
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};
