import { Router } from 'express';

import UbsController from '../controllers/scf/UbsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const ubsRouter = Router();

ubsRouter.use(ensureAuthenticated);

ubsRouter.get('/', UbsController.index);
ubsRouter.post('/', UbsController.store);
ubsRouter.post('/delete', UbsController.delete);
ubsRouter.put('/', UbsController.update);

export default ubsRouter;