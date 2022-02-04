import { Request, response, Response } from 'express';
import { poolTickets } from '../../utils/dbconfig';
import { CallsInterface } from '../../interfaces/Calls';

class TicketWindowController {
  public async store(req: Request, res: Response): Promise<Response> {
    const ticket: CallsInterface = req.body;

    if (ticket.ticketWindow !== undefined && ticket.sectorId !== undefined) {
      try {
        /*
        * Verifica qual é o ultimo chamado e se existe
        */
        var sql = 'select t.id, t.numero, t.prioritario, t.atendimento, s.nome from ticket t inner join setor s on t.setor_id = s.id where t.atendimento = false and t.setor_id = $1 order by t.prioritario desc, t.numero asc limit 1';
        const { rows } = await poolTickets.query(sql, [ticket.sectorId]);

        if (rows.length > 0) {
          var numberCall: String = rows[0].numero.toString().padStart(3, '0');
          // Verifica se é prioritario
          if (rows[0].prioritario === true) {
            numberCall = `P${numberCall}`;
          } else {
            numberCall = `N${numberCall}`;
          }

          /*
          * Inserir na tabela chamados
          */
          sql = 'INSERT INTO chamados(guiche, numero, setor_id) VALUES ($1, $2, $3) returning numero';
          await poolTickets.query(sql, [ticket.ticketWindow, numberCall, ticket.sectorId]);

          /*
          * Atualiza o ticket para atendido
          */
          sql = 'UPDATE ticket SET atendimento = true WHERE id = $1';
          await poolTickets.query(sql, [rows[0].id]);

          return res.json({ numberCall, sectorName: rows[0].nome });
        } else {
          /*
          * Se não haver chamado pega o retorno não dizendo que não há pacientes
          */
          return res.json({ numberCall: 'Não há espera por atendimento' });
        }
      } catch (error) {
        return res.status(400).json(`Error${error}`);
      }
    }

    return res.status(400).json('Post Error');
  }

  public async loadingInitial(req: Request, res: Response): Promise<Response> {
    const ticket: CallsInterface = req.body;

    if (ticket.sectorId !== undefined) {
      try {
        const sql = 'SELECT id, numero, guiche FROM chamados WHERE setor_id = $1 ORDER BY id DESC limit 4';
        const { rows } = await poolTickets.query(sql, [ticket.sectorId]);

        return res.json(rows);
      } catch (error) {
        return res.status(400).send(error);
      }
    }
    return res.status(400).send('Not SectorId');
  }

  public async resetTickets(req: Request, res: Response): Promise<Response> {
    const ticket: CallsInterface = req.body;

    if (ticket.sectorId !== undefined) {
      try {
        var sql = 'DELETE FROM chamados WHERE setor_id = $1';
        await poolTickets.query(sql, [ticket.sectorId]);

        sql = 'DELETE FROM ticket WHERE setor_id = $1';
        await poolTickets.query(sql, [ticket.sectorId]);

        sql = "INSERT INTO chamados(guiche, numero, setor_id) VALUES ('-', '-', $1), ('-', '-', $1), ('-', '-', $1), ('-', '-', $1)";
        await poolTickets.query(sql, [ticket.sectorId]);

        return res.json('Sucess!');
      } catch (error) {
        return res.status(400).send(error);
      }
    }
    return res.status(400).send('Not SectorId');
  }
}

export default new TicketWindowController();
