declare namespace Express {
  export interface Request {
    user: number;
    idUbs: number;
    userPermissions: Array<{ permisionid: number }>;
  }
}
