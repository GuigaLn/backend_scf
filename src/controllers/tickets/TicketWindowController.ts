import { Request, response, Response } from 'express';
import { poolTickets } from '../../utils/dbconfig';
import { CallsInterface } from '../../interfaces/Calls';
import { checkPermision } from '../../utils/checkPermision';

class TicketWindowController {
  /* FUNÇÃO CHAMAR TICKETS - PERMISSÃO NECESSÁRIA 3 */
  public async store(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(3, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    var firstLetter: string;

    const ticket: CallsInterface = req.body;

    if (ticket.ticketWindow !== undefined && ticket.sectorId !== undefined) {
      try {
        /* VERIFICA SE EXISTE UMA SENHA PARA CHAMAR */
        var sql = 'select t.id, t.numero, t.prioritario, t.atendimento, s.nome from ticket t inner join setor s on t.setor_id = s.id where t.atendimento = false and t.setor_id = $1 order by t.prioritario desc, t.numero asc limit 1';
        const { rows } = await poolTickets.query(sql, [ticket.sectorId]);

        if (rows.length > 0) {
          firstLetter = getFirstLetter(rows[0].nome);
          // SE EXISTIR
          var numberCall: String = rows[0].numero.toString().padStart(2, '0');

          // VERIFICA SE É PRIORITARIO OU NÃO
          if (rows[0].prioritario === true) {
            numberCall = `${firstLetter}P${numberCall}`;
          } else {
            numberCall = `${firstLetter}N${numberCall}`;
          }

          // DEPOIS DE FILTRAR E EDITAR O NÚMERO INSERE NA TABELA CHAMADOS
          sql = 'INSERT INTO chamados(guiche, numero, setor_id) VALUES ($1, $2, $3) returning numero';
          await poolTickets.query(sql, [ticket.ticketWindow, numberCall, ticket.sectorId]);

          // ATUALIZA O TICKET PARA ATENDIDO
          sql = 'UPDATE ticket SET atendimento = true WHERE id = $1';
          await poolTickets.query(sql, [rows[0].id]);

          return res.json({ numberCall, sectorName: rows[0].nome });
        } else {
          // CASO NÃO ENCONTRE RETORNA QUE NÃO TEM MAIS ATENDIMENTO
          return res.json({ numberCall: 'Não há espera por atendimento' });
        }
      } catch (error) {
        return res.status(400).json(`Error ${error}`);
      }
    }

    return res.status(400).json(' Not Found TicketWindow Or SectorId');
  }

  // FUTURA REMOÇÃO
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

  /* FUNÇÃO RESETAR TICKETS - PERMISSÃO NECESSÁRIA 3 */
  public async resetTickets(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(3, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

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

function getFirstLetter(sectorName: string) {
  return sectorName.substring(0, 1);
}
