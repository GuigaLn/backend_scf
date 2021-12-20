import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { OccupationInterface } from '../../interfaces/scf/Occupation';

class OccupationController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, id as idoccupation, descricao as description FROM funcao";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const occupation: OccupationInterface = req.body;

    if(occupation.description && occupation.description !== undefined) {
      try {
  
        const sql = "INSERT INTO funcao(descricao) VALUES($1) returning id";
        const returning = await poolScp.query(sql, [occupation.description]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição não localizada!" });
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const occupation: OccupationInterface = req.body;

    if(occupation.description && occupation.description !== undefined) {
      try {

        const sql = "UPDATE funcao set descricao = $1 WHERE id = $2";
        const returning = await poolScp.query(sql, [occupation.description, occupation.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição ou ID não localizada!" });
  }
  
  public async delete (req: Request, res: Response): Promise<Response> {
    const occupation: OccupationInterface = req.body;

    if(occupation.id || occupation.id !== undefined) {
      try {
  
        const sql = "DELETE FROM funcao WHERE id = $1";
        const returning = await poolScp.query(sql, [occupation.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "ID não localizado!" });
  }

}

export default new OccupationController();
