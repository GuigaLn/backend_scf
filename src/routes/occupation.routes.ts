import { Router } from 'express';

import OccupationController from '../controllers/scf/OccupationController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const occupationRouter = Router();

occupationRouter.use(ensureAuthenticated);

occupationRouter.get('/', OccupationController.index);
occupationRouter.post('/', OccupationController.store);
occupationRouter.post('/delete', OccupationController.delete);
occupationRouter.put('/', OccupationController.update);

export default occupationRouter;
