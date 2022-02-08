import { Router } from 'express';

import VacationController from '../controllers/scf/VacationController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const vacationRouter = Router();

vacationRouter.use(ensureAuthenticated);

vacationRouter.get('/', VacationController.index);
vacationRouter.post('/listByEmployee', VacationController.listByEmployee);
vacationRouter.post('/detail', VacationController.detail);
vacationRouter.post('/', VacationController.store);
vacationRouter.post('/delete', VacationController.delete);
vacationRouter.put('/confirm', VacationController.confirm);
vacationRouter.put('/cancel', VacationController.cancel);

export default vacationRouter;
