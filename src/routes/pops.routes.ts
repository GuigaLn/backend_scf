import { Router } from 'express';

import POPsController from '../controllers/scf/POPsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const popsRouter = Router();

popsRouter.get('/', ensureAuthenticated, POPsController.index);
popsRouter.get('/public', POPsController.public);
popsRouter.post('/', ensureAuthenticated, POPsController.store);
popsRouter.put('/', ensureAuthenticated, POPsController.update);
popsRouter.post('/detail', ensureAuthenticated, POPsController.detail);
popsRouter.put('/confirm', ensureAuthenticated, POPsController.confirm);
popsRouter.put('/reject', ensureAuthenticated, POPsController.reject);

export default popsRouter;
