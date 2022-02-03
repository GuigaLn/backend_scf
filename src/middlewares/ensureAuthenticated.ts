import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '../config/auth';

interface TokenPayLoad {
  id: number;
  idUbs: number;
  iat: number;
  exp: number;
}

export default function ensureAuthenticated(req, res, next: NextFunction): void {
  //Validacao do Token

  const authHeader = req.headers.authorization;

  if ( !authHeader ) {
    return res.status(401).json({status: " Token Invalido " });
  }

  // bearer token
  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { id, idUbs } = decoded as TokenPayLoad;

    req.user = id;
    req.idUbs = idUbs;

    return next();
  } catch (error) {
    return res.status(401).json({status: " Token Invalido " });
  }
}