import { Request, Response } from 'express';
import { poolTickets } from '../../utils/dbconfig';
import { TicketInterface } from '../../interfaces/Ticket';

class TotemCallsController {
  // FUNÇÃO GERAR NOVA SENHA - NENHUMA PERMISSÃO
  public async store(req: Request, res: Response): Promise<Response> {
    var sql;
    var numberCall: string;
    var firstLetter: string;

    const tickets: TicketInterface = req.body;

    if (tickets.prioritary !== undefined && tickets.sectorId !== undefined && tickets.sectorName !== undefined) {
      try {
        firstLetter = getFirstLetter(tickets.sectorName);
        /* VERIFICA SE FOI TIRADO ALGUMA SENHA (PARA PEGAR O NÚMERO DA ÚLTIMA) */
        sql = 'SELECT t.numero, s.nome FROM ticket t INNER JOIN setor_senha s ON t.setor_id = s.id WHERE setor_id = $1 AND prioritario = $2 ORDER BY t.id DESC limit 1';
        const { rows } = await poolTickets.query(sql, [tickets.sectorId, tickets.prioritary]);

        if (rows.length === 0) {
          // CASO NÃO TENHA CHAMADOS, ADIONA COM NÚMERO 1
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES (1, $1, $2) returning numero';
          const returning = await poolTickets.query(sql, [tickets.prioritary, tickets.sectorId]);

          numberCall = returning.rows[0].numero.toString().padStart(2, '0');

          if (tickets.prioritary === true) {
            return res.json({ numberCall: `${firstLetter}P${numberCall}`, sector: tickets.sectorName });
          }

          return res.json({ numberCall: `${firstLetter}N${numberCall}`, sector: tickets });
        } else {
          /* SE EXISTIR UM TICKET (PEGA O NÚMERO DO ULTIMO E ADIONA + 1) */
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES ($1, $2, $3) returning numero';
          const returning = await poolTickets.query(sql, [rows[0].numero + 1, tickets.prioritary, tickets.sectorId]);

          numberCall = returning.rows[0].numero.toString().padStart(2, '0');

          if (tickets.prioritary === true) {
            return res.json({ numberCall: `${firstLetter}P${numberCall}`, tickets: rows[0].nome });
          }

          return res.json({ numberCall: `${firstLetter}N${numberCall}`, tickets: rows[0].nome });
        }
      } catch (error) {
        return res.status(400).json(`Error${error}`);
      }
    }

    return res.status(400).json(' Not Found SectorId Or SectorName Or Prioritay! ');
  }
}

export default new TotemCallsController();

function getFirstLetter(sectorName: string) {
  return sectorName.substring(0, 1);
}
