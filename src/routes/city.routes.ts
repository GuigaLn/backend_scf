import { Router } from 'express';

import CityController from '../controllers/scf/CityController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const cityRouter = Router();

cityRouter.use(ensureAuthenticated);

cityRouter.get('/', CityController.index);
cityRouter.post('/', CityController.store);
cityRouter.post('/delete', CityController.delete);
cityRouter.put('/', CityController.update);

export default cityRouter;