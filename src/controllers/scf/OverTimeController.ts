import { Request, Response } from 'express';
import { poolScp } from '../../utils/dbconfig';
import { OvertimeHistory } from '../../interfaces/scf/OvertimeHistory';
import { checkPermision } from '../../utils/checkPermision';

class OverTimeController {
  /* FUNÇÃO DELETAR OBSERVAÇÕES DO PONTO - PERMISSÃO NECESSARIO 1 */
  public async detail(req: Request, res: Response): Promise<Response> {
    // APENAS - SMS
    if (req.idUbs !== 9) { return res.status(403).send('Access for administrators only'); }

    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const overTime: OvertimeHistory =  req.body;
    try {
      if (overTime.id !== null && overTime.id !== undefined) {
        const sql = 'SELECT id, descricao as description, hora_extra as extraHour FROM historico_hora_extra WHERE id_funcionario = $1';
        const { rows } = await poolScp.query(sql, [Number(overTime.id)]);
        const returning = rows;

        return res.send(returning);
      }

      return res.status(400).json({ status: '400', msg: 'ID não localizado!' });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export default new OverTimeController();
