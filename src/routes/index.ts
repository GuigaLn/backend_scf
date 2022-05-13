import { Router } from 'express';

import TotemCallsController from '../controllers/tickets/TotemCallsController';
import TicketWindowController from '../controllers/tickets/TicketWindowController';
import SectorController from '../controllers/tickets/SectorController';

import addressRouter from './address.routes';
import authenticateRouter from './authenticate.routes';
import cityRouter from './city.routes';
import commentsRouter from './comments.routes';
import employeeRouter from './employee.routes';
import occupationRouter from './occupation.routes';
import timeRouter from './time.routes';
import ubsRouter from './ubs.routes';
import vacationRouter from './vacation.routes';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import overtimeRouter from './overtime.routes';
import syncRouter from './sync.routes';

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
routes.use('/occupation', occupationRouter);
routes.use('/ubs', ubsRouter);
routes.use('/time', timeRouter);
routes.use('/vacation', vacationRouter);
routes.use('/overtime', overtimeRouter);
routes.use('/sincronizar', syncRouter);

export default routes;
