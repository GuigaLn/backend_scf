import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { EmployeeInterface } from '../../interfaces/scf/Employee';

class EmployeeController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, nome as name, to_char(data_nascimento, 'DD-MM-YYYY') as birthday, to_char(data_nascimento, 'YYYY-MM-DD') as bedit, cpf, cns, to_char(adimisao, 'YYYY-MM-DD') as admission, matricula as registration FROM funcionario ORDER BY nome ASC";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async shortList (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, matricula as registration, nome as name, id as idemployee FROM funcionario WHERE ponto = true AND demisao IS NULL ORDER BY nome ASC";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async detail (req: Request, res: Response): Promise<Response> {
    const employee: EmployeeInterface = req.body;
    if(employee.id !== undefined) {
      try {
        const sql = "SELECT * FROM funcionario WHERE id = $1";
        const { rows } = await poolScp.query(sql, [employee.id]);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta o ID do Funcionário!" });
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const employee: EmployeeInterface = req.body;

    if(employee.name !== undefined && employee.birthday !== undefined && employee.cpf !== undefined) {
      try {
        if(employee.cns === undefined) { employee.cns = null }
        if(employee.admission === undefined) { employee.admission = null }
        if(employee.resignation === undefined) { employee.resignation = null }
        if(employee.registration === undefined) { employee.registration = null }

        const sql = "INSERT INTO funcionario(nome, data_nascimento, cpf, cns, adimisao, demisao, matricula)" +
        "VALUES($1, $2, $3, $4, $5, $6, $7) returning id";;

        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.admission, employee.resignation, employee.registration]);
  
        return res.json(returning);
      } catch (error) {
        console.log(error)
        return res.status(400).json(error);
      }
    }
    console.log(employee.name);
    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const employee: EmployeeInterface = req.body;

    if(employee.id !== undefined && employee.id !== null && employee.name !== undefined && employee.birthday !== undefined && employee.cpf !== undefined) {
      try {
        if(employee.cns === undefined) { employee.cns = null }
        if(employee.admission === undefined) { employee.admission = null }
        if(employee.registration === undefined) { employee.registration = null }

        const sql = "UPDATE funcionario set nome = $1, data_nascimento = $2, cpf = $3, cns = $4, adimisao = $5, matricula = $6 WHERE id = $7";

        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.admission, employee.registration, employee.id]);
  
        return res.json(returning);
      } catch (error) {
        console.log(error)
        return res.status(400).json(error);
      }
    }
    console.log(employee.name);
    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }
  
}


export default new EmployeeController();
