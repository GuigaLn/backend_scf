import { Request, Response } from 'express';
import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer';
import { poolTickets } from '../../utils/dbconfig';
import { ConfigPrinter, TicketInterface } from '../../interfaces/Ticket';

class TotemCallsController {
  // FUNÇÃO GERAR NOVA SENHA - NENHUMA PERMISSÃO
  public async store(req: Request, res: Response): Promise<Response> {
    var sql;
    var numberCall: string;
    var firstLetter: string;
    let configPrinter: ConfigPrinter = {
      idSector: null,
      nome: null,
      ipPrinter: null,
    };

    const tickets: TicketInterface = req.body;

    // Obter configuracao impressora
    try {
      if (!tickets.token) {
        return res.status(400).json('Token não fornecido');
      }

      const getConfig = 'SELECT id, nome, ip_impressora FROM setor_senha WHERE "token" = $1';
      const { rows } = await poolTickets.query(getConfig, [tickets.token]);
      if (!rows[0] || !rows[0].ip_impressora) {
        return res.status(400).json('Token não configurado');
      }
      configPrinter = {
        idSector: Number(rows[0].id),
        nome: rows[0].nome,
        ipPrinter: rows[0].ip_impressora,
      };
    } catch (error) {
      return res.status(400).json(`Error: ${error}`);
    }

    if (!configPrinter.idSector || !configPrinter.nome || !configPrinter.ipPrinter) {
      return res.status(400).json('Token não configurado');
    }

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: configPrinter.ipPrinter,
      lineCharacter: '=',
      characterSet: CharacterSet.PC850_MULTILINGUAL,
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res.status(500).json({ error: 'Impressora não conectada.' });
    }

    if (tickets.prioritary !== undefined) {
      try {
        firstLetter = getFirstLetter(configPrinter.nome);
        /* VERIFICA SE FOI TIRADO ALGUMA SENHA (PARA PEGAR O NÚMERO DA ÚLTIMA) */
        sql = 'SELECT t.numero, s.nome FROM ticket t INNER JOIN setor_senha s ON t.setor_id = s.id WHERE setor_id = $1 AND prioritario = $2 ORDER BY t.id DESC limit 1';
        const { rows } = await poolTickets.query(sql, [configPrinter.idSector, tickets.prioritary]);

        if (rows.length === 0) {
          // CASO NÃO TENHA CHAMADOS, ADIONA COM NÚMERO 1
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES (1, $1, $2) returning numero';
          const returning = await poolTickets.query(sql, [tickets.prioritary, configPrinter.idSector]);

          numberCall = returning.rows[0].numero.toString().padStart(2, '0');

          printer.alignCenter();
          printer.bold(true);
          printer.println('-- SECRETARIA DE SAÚDE --');
          printer.println('');
          printer.println(`${configPrinter.nome}`);
          printer.println('');
          printer.println(tickets.prioritary === true ? 'PRIORITÁRIO' : 'NORMAL');
          printer.println('');
          printer.setTextSize(7, 7);
          printer.println(tickets.prioritary === true ? `${firstLetter}P${numberCall}` : `${firstLetter}N${numberCall}`);
          printer.cut();
          await printer.execute();

          if (tickets.prioritary === true) {
            return res.json({ numberCall: `${firstLetter}P${numberCall}`, sector: configPrinter.nome });
          }

          return res.json({ numberCall: `${firstLetter}N${numberCall}`, sector: configPrinter.nome });
        } else {
          /* SE EXISTIR UM TICKET (PEGA O NÚMERO DO ULTIMO E ADIONA + 1) */
          sql = 'INSERT INTO ticket(numero, prioritario, setor_id) VALUES ($1, $2, $3) returning numero';
          const returning = await poolTickets.query(sql, [rows[0].numero + 1, tickets.prioritary, configPrinter.idSector]);

          numberCall = returning.rows[0].numero.toString().padStart(2, '0');

          printer.alignCenter();
          printer.bold(true);
          printer.setTextSize(1, 1);
          printer.println('SECRETARIA DE SAÚDE');
          printer.println('');
          printer.println(`-- ${configPrinter.nome} --`);
          printer.println('');
          printer.println(tickets.prioritary === true ? 'PRIORITÁRIO' : 'NORMAL');
          printer.println('');
          printer.setTextSize(7, 7);
          printer.println(tickets.prioritary === true ? `${firstLetter}P${numberCall}` : `${firstLetter}N${numberCall}`);
          printer.cut();
          await printer.execute();

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
