import { Router } from 'express';

import SectorController from '../controllers/tickets/SectorController';
import TicketWindowController from '../controllers/tickets/TicketWindowController';
import TotemCallsController from '../controllers/tickets/TotemCallsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';
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

export default routes;
