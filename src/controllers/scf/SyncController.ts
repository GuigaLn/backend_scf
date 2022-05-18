import { Request, Response } from 'express';
import { poolScp } from '../../utils/dbconfig';

class SyncController {
  /* FUNÇÃO DE SINCRONIZAÇÃO - PERMISSÃO NECESSARIO NENHUMA */
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      console.log(1);
      if (req.body.idUser === '' || !req.body.idUser) { return res.status(400); }
      let sql = 'SELECT * FROM acs_localizacao WHERE id_acs = $1';
      const { rows } = await poolScp.query(sql, [req.body.idUser]);
      let returning = rows;

      req.body.data.map(async (item: any) => {
        const find = returning.find((itemDb: any) => itemDb.responsavel === item.responsavel);

        returning = returning.filter((itemDb: any) => itemDb.responsavel !== item.responsavel);

        if (find) {
          sql = 'UPDATE acs_localizacao set responsavel = $1, observacao = $2, latitude = $3, longitude = $4, hipertenso = $5, diabetico = $6, gestante =$7 WHERE id = $8';
          await poolScp.query(sql, [item.responsavel, item.observacao, item.latitude, item.longitude, item.hipertenso, item.diabetico, item.gestante, find.id]);
        } else {
          sql = 'INSERT INTO acs_localizacao (responsavel, observacao, latitude, longitude, hipertenso, diabetico, gestante, id_acs) VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
          await poolScp.query(sql, [item.responsavel, item.observacao, item.latitude, item.longitude, item.hipertenso, item.diabetico, item.gestante, req.body.idUser]);
        }
      });

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export default new SyncController();
