import { Router } from 'express';

import CommentsController from '../controllers/scf/CommentsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const commentsRouter = Router();

commentsRouter.use(ensureAuthenticated);

commentsRouter.get('/', CommentsController.index);
commentsRouter.post('/', CommentsController.store);
commentsRouter.post('/delete', CommentsController.delete);
commentsRouter.put('/', CommentsController.update);

export default commentsRouter;
