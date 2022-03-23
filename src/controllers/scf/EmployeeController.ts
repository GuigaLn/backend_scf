import { Request, response, Response } from 'express';
import { poolScp } from '../../utils/dbconfig';
import { EmployeeInterface } from '../../interfaces/scf/Employee';
import { checkPermision } from '../../utils/checkPermision';
import moment from 'moment';

class EmployeeController {
  /* FUNÇÃO LISTAR FUNCIONÁRIOS POR UBS - PERMISSÃO NECESSARIO 4 */
  public async index(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const sql = "SELECT id, nome as name, to_char(data_nascimento, 'DD-MM-YYYY') as birthday, to_char(data_nascimento, 'YYYY-MM-DD') as bedit, cpf, cns, matricula as registration, numero_carteira as numberct, serie_carteira as seriesct, id_ubs as ubsid FROM funcionario WHERE id_ubs = $1 OR 9 = $2 ORDER BY nome ASC";
      const { rows } = await poolScp.query(sql, [req.idUbs, req.idUbs]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO LISTAR FUNCIONÁRIOS DO PONTO POR UBS - PERMISSÃO NECESSARIO 2 */
  public async shortList(req: Request, res: Response): Promise<Response> {
    try {
      if (!checkPermision(2, req.userPermissions)) {
        return res.status(403).json({ status: ' Not Permision ' });
      }

      const sql = 'SELECT id, matricula as registration, nome as name, id as idemployee FROM funcionario WHERE ponto = true AND (id_ubs = $1 OR 9 = $2) AND matricula IS NOT NULL AND demisao IS NULL ORDER BY nome ASC';
      const { rows } = await poolScp.query(sql, [req.idUbs, req.idUbs]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO DETALHE DO FUNCIONARIO FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async detail(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const employee: EmployeeInterface = req.body;
    if (employee.id !== undefined) {
      try {
        const sql = "SELECT id, nome as name, to_char(data_nascimento, 'DD-MM-YYYY') as birthday, to_char(data_nascimento, 'YYYY-MM-DD') as bedit, cpf, cns, matricula as registration, numero_carteira as numberct, serie_carteira as seriesct, email as mail, telefone as phone, id_ubs as ubsid, id_funcao as occupationid, carga_horaria as workload, hora_extra as extraHour FROM funcionario WHERE id = $1 AND (id_ubs = $2 OR 9 = $3)";
        const { rows } = await poolScp.query(sql, [employee.id, req.idUbs, req.idUbs]);
        rows[0].extrahour = hhmmss(rows[0].extrahour);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta o ID do Funcionário!' });
  }

  /* FUNÇÃO GERAR EPI FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async detailForEpi(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const employee: EmployeeInterface = req.body;
    if (employee.id !== undefined) {
      try {
        const sql = 'SELECT f.nome as name, f.cpf, f.cns, func.descricao as occupation FROM funcionario f INNER JOIN funcao func ON f.id_funcao = func.id WHERE f.id = $1 AND (f.id_ubs = $2 OR 9 = $3) limit 1';
        const { rows } = await poolScp.query(sql, [employee.id, req.idUbs, req.idUbs]);
        const returning = rows;

        return res.send(returning[0]);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta o ID do Funcionário!' });
  }

  /* FUNÇÃO GRAVAR FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async store(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const employee: EmployeeInterface = req.body;

    if (employee.name !== undefined && employee.birthday !== undefined && employee.cpf !== undefined) {
      try {
        if (employee.cns === undefined) { employee.cns = null; }
        if (employee.registration === undefined) { employee.registration = null; }
        if (employee.workload === undefined || employee.workload === null) { employee.workload = 8; }

        const sql = 'INSERT INTO funcionario(nome, data_nascimento, cpf, cns, matricula, id_ubs, carga_horaria)'
        + 'VALUES($1, $2, $3, $4, $5, $6, $7) returning id';

        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.registration, req.idUbs, employee.workload]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }

  /* FUNÇÃO ATUALIZAR FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async update(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const employee: EmployeeInterface = req.body.data;

    if (employee.id !== undefined && employee.id !== null && employee.name !== undefined && employee.birthday !== undefined && employee.cpf !== undefined) {
      try {
        if (employee.cns === undefined) { employee.cns = null; }
        if (employee.registration === undefined) { employee.registration = null; }
        if (employee.numberct === undefined) { employee.numberct = null; }
        if (employee.seriesct === undefined) { employee.seriesct = null; }
        if (employee.phone === undefined) { employee.phone = null; }
        if (employee.mail === undefined) { employee.mail = null; }
        if (employee.workload === undefined || employee.workload === null) { employee.workload = 8; }

        const sql = 'UPDATE funcionario set nome = $1, data_nascimento = $2, cpf = $3, cns = $4, matricula = $5, numero_carteira = $6, serie_carteira = $7, telefone = $8, email = $9, id_ubs = $10, id_funcao = $11, carga_horaria = $12 WHERE id = $13';

        const returning = await poolScp.query(sql, [employee.name.toUpperCase(), employee.birthday, employee.cpf, employee.cns, employee.registration, employee.numberct, employee.seriesct, employee.phone, employee.mail, employee.ubsid, employee.occupationid, employee.workload, employee.id]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }

  /* FUNÇÃO ADICIONAR HORA EXTRA FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async addExtraHours(req: Request, res: Response): Promise<Response> {
    // APENAS - SMS
    if (req.idUbs !== 9) { return res.status(403).send('Access for administrators only'); }

    if (!checkPermision(1, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const { description } = req.body;
    const employee: EmployeeInterface = req.body;

    if (employee.id !== undefined && employee.id !== null && employee.extraHour !== undefined && employee.extraHour !== null && description !== null && description !== undefined) {
      try {
        let sql = 'INSERT INTO historico_hora_extra(descricao, hora_extra, id_funcionario, gerado_por) VALUES ($1, $2, $3, $4)';
        await poolScp.query(sql, [description, employee.extraHour, employee.id, req.user]);

        sql = 'UPDATE funcionario set hora_extra = hora_extra + $1 WHERE id = $2';

        const returning = await poolScp.query(sql, [moment.duration(employee.extraHour).asSeconds(), employee.id]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }

  /* FUNÇÃO FOLGA FUNCIONÁRIOS - PERMISSÃO NECESSARIO 4 */
  public async addDayOff(req: Request, res: Response): Promise<Response> {
    // APENAS - SMS
    if (req.idUbs !== 9) { return res.status(403).send('Access for administrators only'); }

    if (!checkPermision(1, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const { description, day } = req.body;

    const employee: EmployeeInterface = req.body;

    if (employee.id !== undefined && employee.id !== null && employee.extraHour !== undefined && employee.extraHour !== null && day !== null && day !== undefined) {
      try {
        const descriptionWithDay = `Folga - ${moment(day).format('DD/MM/YYYY')}`;
        let sql = 'INSERT INTO historico_hora_extra(descricao, hora_extra, id_funcionario, gerado_por) VALUES ($1, $2, $3, $4)';
        await poolScp.query(sql, [descriptionWithDay, employee.extraHour, employee.id, req.user]);

        sql = 'UPDATE funcionario set hora_extra = hora_extra - $1 WHERE id = $2';

        const returning = await poolScp.query(sql, [moment.duration(employee.extraHour).asSeconds(), employee.id]);

        return res.json(returning);
      } catch (error) {
        console.log(error)
        return res.status(400).json(error);
      }
    }
    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }
}

/* RETORNA O SEGUNDOS EM HH:MM:SS */
function hhmmss(secs: number) {
  let minutes = Math.floor(secs / 60);
  secs %= 60;
  const hours = Math.floor(minutes / 60);
  minutes %= 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(Math.round(secs))}`;
}

/* FORMATA O NUMERO */
function pad(num: any) {
  if (num > 100) {
    return num;
  }
  return (`0${num}`).slice(-2);
}

export default new EmployeeController();
