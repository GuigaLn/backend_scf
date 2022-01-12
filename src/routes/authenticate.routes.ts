import { Router } from 'express';

import AuthenticateController from '../controllers/scf/AuthenticateController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const authenticateRouter = Router();

authenticateRouter.post('/', AuthenticateController.login);
authenticateRouter.post('/new', ensureAuthenticated, AuthenticateController.store);

export default authenticateRouter;