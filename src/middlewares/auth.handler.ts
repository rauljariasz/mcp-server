import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default';

// Middleware de JWT para ver si estamos autenticados
export const authenticatedReq = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : '';

  const refreshHeader = req.headers['refresh_token'];
  const refresh = typeof refreshHeader === 'string' ? refreshHeader : '';

  //   Si no existe retornamos un 401
  if (!refresh || !token) {
    return res.status(401).json({
      message: 'No autorizado',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Si el access token da error, lo refrescamos con el refresh y lo mandamos en los header
      // de la respuesta
      return jwt.verify(
        refresh,
        JWT_SECRET,
        (errRefresh, decodedRefresh: any) => {
          // Si el refresh da error, no se autoriza
          if (errRefresh) {
            return res.status(401).json({
              message: 'No autorizado.',
            });
          }

          // Si no da error, se genera un nuevo accesstoken
          const newAccessToken = jwt.sign(
            {
              id: decodedRefresh.id,
              email: decodedRefresh.email,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
          );

          res.set('Token', newAccessToken);

          return res.status(403).json({
            message: 'Access token vencido.',
          });
        }
      );
    }

    // Le agregamos la información a la request
    req.body.token = decoded;

    res.set('Token', token);

    // Todo OK!.
    next();
  });
};
