import { Request, response, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { EmployeeInterface } from '../../interfaces/scf/Employee';

class EmployeeController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, nome as name, to_char(data_nascimento, 'DD-MM-YYYY') as birthday, to_char(data_nascimento, 'YYYY-MM-DD') as bedit, cpf, cns, matricula as registration, numero_carteira as numberct, serie_carteira as seriesct, id_ubs as ubsid FROM funcionario WHERE id_ubs = $1  ORDER BY nome ASC";
      const { rows } = await poolScp.query(sql, [ req.idUbs ]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async shortList (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, matricula as registration, nome as name, id as idemployee FROM funcionario WHERE ponto = true AND id_ubs = $1 AND demisao IS NULL ORDER BY nome ASC";
      const { rows } = await poolScp.query(sql, [ req.idUbs ]);
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
        const sql = "SELECT id, nome as name, to_char(data_nascimento, 'DD-MM-YYYY') as birthday, to_char(data_nascimento, 'YYYY-MM-DD') as bedit, cpf, cns, matricula as registration, numero_carteira as numberct, serie_carteira as seriesct, email as mail, telefone as phone, id_ubs as ubsid, id_funcao as occupationid FROM funcionario WHERE id = $1 AND id_ubs = $2";
        const { rows } = await poolScp.query(sql, [ employee.id, req.idUbs ]);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta o ID do Funcionário!" });
  }

  public async detailForEpi (req: Request, res: Response): Promise<Response> {
    const employee: EmployeeInterface = req.body;
    if(employee.id !== undefined) {
      try {
        const sql = "SELECT f.nome as name, f.cpf, f.cns, func.descricao as occupation FROM funcionario f INNER JOIN funcao func ON f.id_funcao = func.id WHERE f.id = $1 AND f.id_ubs = $2 limit 1";
        const { rows } = await poolScp.query(sql, [ employee.id, req.idUbs ]);
        const returning = rows;

        return res.send(returning[0]);
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
        if(employee.registration === undefined) { employee.registration = null }

        const sql = "INSERT INTO funcionario(nome, data_nascimento, cpf, cns, matricula, id_ubs)" +
        "VALUES($1, $2, $3, $4, $5, $6) returning id";;

        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.registration, req.idUbs]);
  
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
    const employee: EmployeeInterface = req.body.data;

    if(employee.id !== undefined && employee.id !== null && employee.name !== undefined && employee.birthday !== undefined && employee.cpf !== undefined) {
      try {
        if(employee.cns === undefined) { employee.cns = null }
        if(employee.registration === undefined) { employee.registration = null }
        if(employee.numberct === undefined) { employee.numberct = null}
        if(employee.seriesct === undefined) { employee.seriesct = null }
        if(employee.phone === undefined) { employee.phone = null }
        if(employee.mail === undefined) { employee.mail = null }

        const sql = "UPDATE funcionario set nome = $1, data_nascimento = $2, cpf = $3, cns = $4, matricula = $5, numero_carteira = $6, serie_carteira = $7, telefone = $8, email = $9, id_ubs = $10, id_funcao = $11 WHERE id = $12";
        
        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.registration, employee.numberct, employee.seriesct, employee.phone, employee.mail, employee.ubsid, employee.occupationid, employee.id]);

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
