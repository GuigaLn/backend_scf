import { Router } from 'express';

import TimeAttendanceController from '../controllers/scf/TimeAttendanceController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const timeRouter = Router();

timeRouter.post('/', TimeAttendanceController.store);
timeRouter.put('/', ensureAuthenticated, TimeAttendanceController.update);

timeRouter.post('/detail', ensureAuthenticated, TimeAttendanceController.index);

export default timeRouter;
