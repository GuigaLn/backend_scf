import { Router } from 'express';
import pdf from 'html-pdf';

import SectorController from '../controllers/tickets/SectorController';
import TicketWindowController from '../controllers/tickets/TicketWindowController';
import TotemCallsController from '../controllers/tickets/TotemCallsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { poolScp } from '../utils/dbconfig';
import addressRouter from './address.routes';
import authenticateRouter from './authenticate.routes';
import cityRouter from './city.routes';
import commentsRouter from './comments.routes';
import contactRouter from './contact.routes';
import employeeRouter from './employee.routes';
import occupationRouter from './occupation.routes';
import overtimeRouter from './overtime.routes';
import popsRouter from './pops.routes';
import sectorRouter from './sector.routes';
import syncRouter from './sync.routes';
import timeRouter from './time.routes';
import ubsRouter from './ubs.routes';
import vacationRouter from './vacation.routes';

const routes = Router();

/* ROTAS - SISTEMA DE SENHAS */
routes.post('/totemCalls', TotemCallsController.store);

routes.post('/TicketWindowController', ensureAuthenticated, TicketWindowController.store);
routes.post('/loadingInitialWindow', ensureAuthenticated, TicketWindowController.loadingInitial);
routes.post('/resetTickets', ensureAuthenticated, TicketWindowController.resetTickets);

routes.get('/sector', SectorController.index);
routes.post('/sector', SectorController.store);

/* ROTAS - SISTEMA SCP */

routes.use('/address', addressRouter);
routes.use('/login', authenticateRouter);
routes.use('/city', cityRouter);
routes.use('/comments', commentsRouter);
routes.use('/employee', employeeRouter);
routes.use('/contact', contactRouter);
routes.use('/occupation', occupationRouter);
routes.use('/ubs', ubsRouter);
routes.use('/time', timeRouter);
routes.use('/vacation', vacationRouter);
routes.use('/overtime', overtimeRouter);
routes.use('/sincronizar', syncRouter);
routes.use('/pops', popsRouter);
routes.use('/sector2', sectorRouter);
routes.post('/pdf', async (request, response) => {
  const sql = `select p.id, p.numero as number, p.titulo as title, to_char(p."data" , 'DD/MM/YYYY') as date,
  fap.nome as autorized_by, p.cancelado_por as canceled_by, p.conteudo as content, p.versao as version,
   p.cancelamento_motivo as cancellationreason, p.area as zone, p.executante, p.objetivo
   from pops p 
   left join usuario_login ap on ap.id = p.autorizado_por
   left join funcionario fap on fap.id = ap.id_funcionario
   ORDER BY p.cancelado_por NULLS FIRST, p.autorizado_por NULLS FIRST, p.numero`;

  const { rows } = await poolScp.query(sql);

  var html = `<div style="position: relative; height: 100%;page-break-after:always; -webkit-justify-content: center;-webkit-align-items: center;-webkit-flex-flow: column">
    <img style="width: 80%; " src="http://192.168.10.184:3333/uploads/timbre.png" />
    <h1 style="position: absolute; top: calc(50% - 23px); margin: 0px 120px; text-align: center;">POP PROCEDIMENTO OPERACIONAL PADRÃO PARA A UNIDADE BÁSICA DE SAÚDE</h1>
    <div style="position: absolute; bottom: 0; text-align: center; width: 100%">CRUZ MACHADO - PR <br /> 2022</div>
  </div>`;

  rows.forEach((item) => {
    const content = `<table style="page-break-after:always;border-collapse: collapse; ">
      <tr>
        <th style="border: 1px solid grey; font-size: 26px; padding: 10px 10px;" colSpan="4">
          PROCEDIMENTO OPERACIONAL PADRÃO
        </th>
      </tr>
      <tr>
        <th style="border: 1px solid grey; ">
          NÚMERO: <br /> ${item.number}
        </th>
        <th style="border: 1px solid grey; ">
          DATA DA VALIDAÇÃO: <br /> ${item.date} 
        </th>
        <th style="border: 1px solid grey; ">
          DATA DA REVISÃO: <br /> ${item.date}
        </th>
        <th style="border: 1px solid grey; ">
          VERSÃO: <br /> ${item.version}
        </th>
      </tr>
      <tr>
        <th style="border: 1px solid grey; font-size: 20px; padding: 10px 10px;" colSpan="4">
          ${item.title}
        </th>
      </tr>
      <tr>
        <td style="border: 1px solid grey; font-size: 16px; padding: 10px 10px; text-align: center;" colSpan="4">
        <b>EXECUTANTE:</b> ${item.executante}
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid grey; font-size: 16px; padding: 10px 10px; text-align: center;" colSpan="4">
         <b>ÁREA:</b>  ${item.zone}
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid grey; font-size: 16px; padding: 10px 10px; text-align: center;" colSpan="4">
        <b>OBJETIVO:</b> ${item.objetivo}
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid grey; padding: 40px 40px;" colSpan="4">
          ${item.content}
        </td>
      </tr>
    </table>`;

    html += content;
  });

  var options: any = {
    format: 'A4',
    border: {
      top: '30px', bottom: '30px', left: '10px', right: '10px',
    },
    paginationOffset: 2,
    footer: {
      height: '16px',
      contents: {
        first: 'SMS',
        default: '<div style="color: #444; margin-top: 40px; text-align: right;"><span>{{page}}</span>/<span>{{pages}}</span></div>', // fallback value
        last: 'Last Page',
      },
    },
  };

  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) return response.status(500).json(err);

    return response.send(`data:application/pdf;base64,${buffer.toString('base64')}`);
  });
});

export default routes;
