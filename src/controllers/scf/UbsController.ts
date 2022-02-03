import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { UsbInterface } from '../../interfaces/scf/Ubs';

class UbsController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, id as idubs, descricao as description FROM unidade_de_saude";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const ubs: UsbInterface = req.body;

    if(ubs.description && ubs.description !== undefined) {
      try {
  
        const sql = "INSERT INTO unidade_de_saude(descricao) VALUES($1) returning id";
        const returning = await poolScp.query(sql, [ubs.description]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição não localizada!" });
  }

  public async update (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const ubs: UsbInterface = req.body;

    if(ubs.description && ubs.description !== undefined && ubs.id && ubs.id !== undefined) {
      try {
  
        const sql = "UPDATE unidade_de_saude set descricao = $1 WHERE id = $2";
        const returning = await poolScp.query(sql, [ubs.description, ubs.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição OU ID não localizado!" });
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const ubs: UsbInterface = req.body;

    if(ubs.id || ubs.id !== undefined) {
      try {
  
        const sql = "DELETE FROM unidade_de_saude WHERE id = $1";
        const returning = await poolScp.query(sql, [ubs.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "ID não localizado!" });
  }

}

export default new UbsController();
