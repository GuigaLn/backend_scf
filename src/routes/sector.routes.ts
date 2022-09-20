import { Router } from 'express';

import SectorController from '../controllers/scf/SectorController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const sectorRouter = Router();

sectorRouter.use(ensureAuthenticated);

sectorRouter.get('/', SectorController.index);

export default sectorRouter;
