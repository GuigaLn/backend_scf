import { Request, Response } from 'express';
import { poolTickets } from '../../utils/dbconfig';
import { TicketInterface } from '../../interfaces/Ticket';

class TotemCallsController {
  public async store(req: Request, res: Response): Promise<Response> {
    var sql;
    var numberCall: string;
    // clients[0].emit('msg', "P"+numberCall);
    const sector: TicketInterface = req.body;

    if (sector.prioritary !== undefined || sector.sectorId !== undefined) {
      try {
        /*
        * Verifica se ja existe algum chamado no setor com a mesma tipo
        */
        sql = 'SELECT t.numero, s.nome FROM ticket t INNER JOIN setor s ON t.setor_id = s.id WHERE setor_id = $1 AND prioritario = $2 ORDER BY t.id DESC limit 1';
        const { rows } = await poolTickets.query(sql, [sector.sectorId, sector.prioritary]);

        if (rows.length === 0) {
          sql = 'SELECT s.nome FROM setor s WHERE id = $1 limit 1';
          const { rows } = await poolTickets.query(sql, [sector.sectorId]);
          /*
          * Se não haver chamado cria um com o numero 1
          */
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES (1, $1, $2) returning numero';
          const returning = await poolTickets.query(sql, [sector.prioritary, sector.sectorId]);

          numberCall = returning.rows[0].numero.toString().padStart(3, '0');

          if (sector.prioritary === true) {
            return res.json({ numberCall: `P${numberCall}`, sector: rows[0].nome });
          }

          return res.json({ numberCall: `N${numberCall}`, sector: rows[0].nome });
        } else {
          /*
          * Se não haver chamado pega o retorno e adiciona + 1
          */
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES ($1, $2, $3) returning numero';
          const returning = await poolTickets.query(sql, [rows[0].numero + 1, sector.prioritary, sector.sectorId]);

          numberCall = returning.rows[0].numero.toString().padStart(3, '0');

          if (sector.prioritary === true) {
            return res.json({ numberCall: `P${numberCall}`, sector: rows[0].nome });
          }

          return res.json({ numberCall: `N${numberCall}`, sector: rows[0].nome });
        }
      } catch (error) {
        return res.status(400).json(`Error${error}`);
      }
    }

    return res.status(400).json('Post Error');
  }
}

export default new TotemCallsController();
