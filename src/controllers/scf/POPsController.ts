import { Request, Response } from 'express';

import { checkPermision } from '../../utils/checkPermision';
import { poolScp } from '../../utils/dbconfig';

class POPsController {
  /* FUNÇÃO LISTAR POP - PERMISSÃO NECESSARIO NENHUMA */
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = `select p.id, p.titulo as title, p.arquivo as file, to_char(p."data" , 'DD/MM/YYYY') as date, s.nome as sector,
      gp.login as genereted_by, fap.nome as autorized_by, p.canelado_por as canceled_by, p.cancelamento_motivo as cancellationreason
      from pops p 
      inner join setor s on s.id = p.id_setor 
      inner join usuario_login gp on gp.id = p.gerado_por 
      left join usuario_login ap on ap.id = p.autorizado_por
      left join funcionario fap on fap.id = ap.id_funcionario
      ORDER BY p.canelado_por NULLS FIRST, p.autorizado_por NULLS FIRST`;

      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO GRAVAR POP - PERMISSÃO NECESSARIO 8 */
  public async store(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(8, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    if (req.file && req.body.title && req.body.sector && req.body.title !== '') {
      try {
        const sql = 'INSERT INTO pops(titulo, arquivo, id_setor, gerado_por) VALUES($1, $2, $3, $4) returning id';
        const returning = await poolScp.query(sql, [req.body.title, req.file.filename, Number(req.body.sector), req.user]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Título ou Setor não localizado!' });
  }

  /* FUNÇÃO AUTORIZAR POP - PERMISSÃO NECESSARIO 9 */
  public async confirm(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(9, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      if (!req.body.id || req.body.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = 'UPDATE pops SET autorizado_por = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [req.user, req.body.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO REJEITAR POP - PERMISSÃO NECESSARIO 9 */
  public async reject(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(9, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      if (!req.body.id || req.body.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = 'UPDATE pops SET canelado_por = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [req.user, req.body.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export default new POPsController();
