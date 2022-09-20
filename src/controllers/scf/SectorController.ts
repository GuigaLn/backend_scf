import { Request, Response } from 'express';
import { poolScp } from '../../utils/dbconfig';

class SectorController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = 'SELECT id, nome as name FROM setor';
      const { rows } = await poolScp.query(sql);
      const sector = rows;

      return res.send(sector);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export default new SectorController();
