import { Request, Response } from 'express';
import { poolTickets } from '../../utils/dbconfig';
import { SectorInterface } from '../../interfaces/Sector';

class SectorController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = 'SELECT * FROM setor';
      const { rows } = await poolTickets.query(sql);
      const sector = rows;

      return res.send(sector);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    const sector: SectorInterface = req.body;

    if (sector.name || sector.name !== undefined) {
      try {
        const sql = 'INSERT INTO setor(nome) VALUES($1) returning id';
        const returning = await poolTickets.query(sql, [sector.name]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json('Post Error');
  }
}
/* TESTE */
export default new SectorController();
