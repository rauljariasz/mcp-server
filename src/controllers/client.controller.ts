import { Request, Response } from 'express';
import users from '../models/user.prisma';
import { comparePasswords, hashPassword } from '../services/auth.service';

// Obtener datos del usuario
export const getDataUser = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    // *-----* //
    // Logica //
    // *---* //
    const { password, id: userId, ...userInfo } = user;
    res.status(200).json({
      data: {
        ...userInfo,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};

// Cambiar usuario, nombre y apellido.
export const editProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body?.token;
  const { name, last_name, username } = req.body;

  try {
    // *---------------* //
    // Pre-validaciones //
    // *-------------* //

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

    if (!name || !last_name || !username) {
      res.status(400).json({
        message: 'Nombre, apellido y usuario necesarios',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //

    if (username !== user.username) {
      const isUserAvailable = await users.findUnique({
        where: { username },
      });

      if (isUserAvailable) {
        // Si ya existe devolvemos status 400
        res.status(400).json({
          message:
            'El usuario ingresado no esta disponible, porfavor ingresa otro.',
        });
      } else {
        // De lo contrario, actualizamos los datos
        await users.update({
          where: { id },
          data: {
            name,
            last_name,
            username,
          },
        });
        res.status(200).json({
          message: 'Tu perfil ha sido actualizado correctamente.',
          data: {
            name,
            last_name,
            username,
          },
        });
      }
    } else {
      // Si no existen cambios, devolvemos status 400.
      // Este caso no deberia de darse.
      if (name === user.name && last_name === user.last_name) {
        res.status(400).json({
          message: 'No existen cambios en los datos.',
        });
        return;
      }

      // Actualizamos solo nombre y apellido
      await users.update({
        where: { id },
        data: {
          name,
          last_name,
        },
      });
      res.status(200).json({
        message: 'Tu perfil ha sido actualizado correctamente.',
        data: {
          name,
          last_name,
          username,
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

// Cambiar correo
// Cambiar usuario, nombre y apellido.
export const editEmail = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body?.token;
  const { email, password } = req.body;

  try {
    // *---------------* //
    // Pre-validaciones //
    // *-------------* //

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

    if (!email || !password) {
      res.status(400).json({
        message: 'Correo y contraseña necesarios.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      res
        .status(400)
        .json({ message: 'La contraseña introducida es incorrecta.' });
      return;
    }

    const isEmailAvailable = await users.findUnique({
      where: { email },
    });

    if (isEmailAvailable) {
      res.status(400).json({
        message:
          'El correo introducido no esta disponible, porfavor elige otro.',
      });
      return;
    }

    await users.update({
      where: { id },
      data: {
        email,
      },
    });

    res.status(200).json({
      message: 'Tu correo fue cambiado exitosamente.',
      data: {
        email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};

// Cambiar correo
// Cambiar usuario, nombre y apellido.
export const editPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body?.token;
  const { password, new_password } = req.body;

  try {
    // *---------------* //
    // Pre-validaciones //
    // *-------------* //

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

    if (!new_password || !password) {
      res.status(400).json({
        message: 'Contraseña y nueva contraseña necesarios.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      res
        .status(400)
        .json({ message: 'La contraseña introducida es incorrecta.' });
      return;
    }

    const hashedPassword = await hashPassword(new_password);

    const isSamePassword = await comparePasswords(new_password, user.password);

    if (isSamePassword) {
      res
        .status(400)
        .json({
          message:
            'No puedes usar la misma contraseña, por favor introduce otra.',
        });
      return;
    }

    await users.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: 'Tu contraseña fue cambiada exitosamente.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};
