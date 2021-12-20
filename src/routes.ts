import { Router } from 'express'

import TotemCallsController from './controllers/tickets/TotemCallsController';
import TicketWindowController from './controllers/tickets/TicketWindowController';
import SectorController from './controllers/tickets/SectorController';

import AuthenticateController from './controllers/scf/AuthenticateController';
import UbsController from './controllers/scf/UbsController';
import OccupationController from './controllers/scf/OccupationController';
import CityController from './controllers/scf/CityController';
import EmployeeController from './controllers/scf/EmployeeController';
import ContactController from './controllers/scf/ContactController';
import MailController from './controllers/scf/MailController';
import AddressController from './controllers/scf/AddressController';
import TimeAttendanceController from './controllers/scf/TimeAttendanceController';
import CommentsController from './controllers/scf/CommentsController';

const routes = Router();

/* ROTAS - SISTEMA DE SENHAS */
routes.post('/totemCalls', TotemCallsController.store);

routes.post('/TicketWindowController', TicketWindowController.store);
routes.post('/loadingInitialWindow', TicketWindowController.loadingInitial);
routes.post('/resetTickets', TicketWindowController.resetTickets);

routes.get('/sector', SectorController.index);
routes.post('/sector', SectorController.store);

/* ROTAS - SISTEMA SCP */
routes.post('/login', AuthenticateController.login);
routes.post('/newlogin', AuthenticateController.store);

routes.get('/ubs', UbsController.index);
routes.post('/ubs', UbsController.store);
routes.post('/ubs/delete', UbsController.delete);
routes.put('/ubs', UbsController.update);

routes.get('/occupation', OccupationController.index);
routes.post('/occupation', OccupationController.store);
routes.post('/occupation/delete', OccupationController.delete);
routes.put('/occupation', OccupationController.update);

routes.get('/comments', CommentsController.index);
routes.post('/comments', CommentsController.store);
routes.post('/comments/delete', CommentsController.delete);
routes.put('/comments', CommentsController.update);

routes.get('/city', CityController.index);
routes.post('/city', CityController.store);
routes.post('/city/delete', CityController.delete);
routes.put('/city', CityController.update);

routes.get('/employee', EmployeeController.index);
routes.post('/employee', EmployeeController.store);
routes.put('/employee', EmployeeController.update);
routes.get('/employee/shortlist', EmployeeController.shortList);
routes.get('/employee/detail', EmployeeController.detail);

routes.get('/contact', ContactController.index);
routes.post('/contact', ContactController.store);
routes.get('/contact/detail', ContactController.detail);

routes.get('/mail', MailController.index);
routes.post('/mail', MailController.store);
routes.get('/mail/detail', MailController.detail);

routes.get('/address', AddressController.index);
routes.post('/address', AddressController.store);
routes.get('/address/detail', AddressController.detail);

routes.post('/time', TimeAttendanceController.store);
routes.post('/timee', TimeAttendanceController.index);
routes.put('/time', TimeAttendanceController.update);

export default routes;
