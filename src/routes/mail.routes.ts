import { Router } from 'express';

import MailController from '../controllers/scf/MailController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const mailRouter = Router();

mailRouter.use(ensureAuthenticated);

mailRouter.get('/', MailController.index);
mailRouter.post('/', MailController.store);
mailRouter.get('/detail', MailController.detail);

export default mailRouter;