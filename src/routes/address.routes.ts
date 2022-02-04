import { Router } from 'express';

import AddressController from '../controllers/scf/AddressController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const addressRouter = Router();

addressRouter.use(ensureAuthenticated);

addressRouter.get('/', AddressController.index);
addressRouter.post('/', AddressController.store);
addressRouter.get('/detail', AddressController.detail);

export default addressRouter;
