import { Router } from 'express';

import SyncController from '../controllers/scf/SyncController';

const syncRouter = Router();

syncRouter.post('/', SyncController.index);

export default syncRouter;
