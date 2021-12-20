import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { ContactInterface } from '../../interfaces/scf/Contact';

class ContactController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT * FROM contato";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async detail (req: Request, res: Response): Promise<Response> {
    const contact: ContactInterface = req.body;
    if(contact.idEmployee !== undefined) {
      try {
        const sql = "SELECT * FROM contato WHERE id_funcionario = $1";
        const { rows } = await poolScp.query(sql, [contact.idEmployee]);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta o ID do Funcionário!" });
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const contact: ContactInterface = req.body;

    if(contact.idEmployee !== undefined && contact.phone !== undefined) {
      try {
        const sql = "INSERT INTO contato(telefone, id_funcionario) VALUES($1, $2) returning id";;

        const returning = await poolScp.query(sql, [contact.phone, contact.idEmployee]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }
  
}


export default new ContactController();
