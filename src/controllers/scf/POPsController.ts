import { Request, Response } from 'express';

import { checkPermision } from '../../utils/checkPermision';
import { poolScp } from '../../utils/dbconfig';

class POPsController {
  /* FUNÇÃO LISTAR POP - PERMISSÃO NECESSARIO NENHUMA */
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = `select p.id, p.numero as number, p.titulo as title, to_char(p."data" , 'DD/MM/YYYY') as date,
      fap.nome as autorized_by, p.cancelado_por as canceled_by, 
       p.cancelamento_motivo as cancellationreason
       from pops p 
       left join usuario_login ap on ap.id = p.autorizado_por
       left join funcionario fap on fap.id = ap.id_funcionario
       ORDER BY p.cancelado_por NULLS FIRST, p.autorizado_por NULLS FIRST, p.numero`;

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

    if (req.body.title && req.body.title !== '') {
      try {
        const sql = `INSERT INTO pops(titulo, versao, numero, executante, area, objetivo, preparado_por, revisado_por, conteudo) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`;
        const returning = await poolScp.query(sql, [
          req.body.title,
          req.body.version || '',
          req.body.number || '',
          req.body.performer || '',
          req.body.zone || '',
          req.body.objective || '',
          req.body.madeBy || '',
          req.body.reviewedBy || '',
          req.body.content || '',
        ]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Título ou Setor não localizado!' });
  }

  /* FUNÇÃO DETALHAR POP - PERMISSÃO NECESSARIO 8 */
  public async detail(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(8, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    if (req.body.id) {
      try {
        const sql = `SELECT titulo as title, versao as version, numero as number, executante as performer, 
        area as zone, objetivo as objective, preparado_por as madeBy, revisado_por as reviewedBy, conteudo as content
        FROM pops WHERE id = $1`;
        const returning = await poolScp.query(sql, [Number(req.body.id)]);

        return res.json({ data: returning.rows[0] });
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Título ou Setor não localizado!' });
  }

  /* FUNÇÃO GRAVAR POP - PERMISSÃO NECESSARIO 8 */
  public async update(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(8, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    if (req.body.id && req.body.title && req.body.title !== '' && req.body.content && req.body.content !== '') {
      try {
        const sql = `UPDATE pops SET titulo = $1, versao = $2, numero = $3, executante = $4, area = $5, objetivo = $6, 
        preparado_por = $7, revisado_por = $8, conteudo = $9, autorizado_por = $10, cancelado_por = $11, cancelamento_motivo = $12
        WHERE id = $13`;
        const returning = await poolScp.query(sql, [
          req.body.title,
          req.body.version || '',
          req.body.number || '',
          req.body.performer || '',
          req.body.zone || '',
          req.body.objective || '',
          req.body.madeBy || '',
          req.body.reviewedBy || '',
          req.body.content || '',
          null,
          null,
          null,
          req.body.id,
        ]);

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

      const sql = 'UPDATE pops SET cancelado_por = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [req.user, req.body.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO LISTAR POP APROVADOS - PERMISSÃO NECESSARIO NENHUMA */
  public async public(req: Request, res: Response): Promise<Response> {
    try {
      const sql = `select p.id, p.titulo as title, p.arquivo as file, to_char(p."data" , 'DD/MM/YYYY') as date, s.nome as sector,
      gp.login as genereted_by, fap.nome as autorized_by, p.canelado_por as canceled_by, p.cancelamento_motivo as cancellationreason
      from pops p 
      inner join setor s on s.id = p.id_setor 
      inner join usuario_login gp on gp.id = p.gerado_por 
      left join usuario_login ap on ap.id = p.autorizado_por
      left join funcionario fap on fap.id = ap.id_funcionario
      WHERE p.autorizado_por IS NOT NULL AND p.canelado_por IS NULL
      ORDER BY s.nome, p.id`;

      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export default new POPsController();
