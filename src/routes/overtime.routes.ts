import { Router } from 'express';

import OverTimeController from '../controllers/scf/OverTimeController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const overtimeRouter = Router();

overtimeRouter.use(ensureAuthenticated);

overtimeRouter.post('/', OverTimeController.detail);

export default overtimeRouter;
