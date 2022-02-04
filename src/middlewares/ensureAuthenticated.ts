import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '../config/auth';

interface TokenPayLoad {
  id: number;
  idUbs: number;
  userPermissions: Array<{ permisionid: number }>;
  iat: number;
  exp: number;
}

export default function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Validacao do Token

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ status: ' Token Invalido ' });
  }

  // bearer token
  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { id, idUbs, userPermissions } = decoded as TokenPayLoad;

    req.user = id;
    req.idUbs = idUbs;
    req.userPermissions = userPermissions;

    return next();
  } catch (error) {
    return res.status(401).json({ status: ' Token Invalido ' });
  }
}
