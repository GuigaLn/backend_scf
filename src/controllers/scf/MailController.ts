import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { MailInterface } from '../../interfaces/scf/Mail';

class MailController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT * FROM email";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async detail (req: Request, res: Response): Promise<Response> {
    const mail: MailInterface = req.body;
    if(mail.idEmployee !== undefined) {
      try {
        const sql = "SELECT * FROM email WHERE id_funcionario = $1";
        const { rows } = await poolScp.query(sql, [mail.idEmployee]);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta o ID do Funcionário!" });
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const mail: MailInterface = req.body;

    if(mail.idEmployee !== undefined && mail.mail !== undefined) {
      try {
        const sql = "INSERT INTO email(email, id_funcionario) VALUES($1, $2) returning id";;

        const returning = await poolScp.query(sql, [mail.mail, mail.idEmployee]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }
  
}


export default new MailController();
