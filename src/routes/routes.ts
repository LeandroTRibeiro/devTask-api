import { Request, Response, Router } from 'express';

import * as UserMiddleware from '../middlewares/UserMiddlewares';
import * as UserController from '../controllers/UserController';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
    res.send({'pong': 'true'});
});

// user - login register recover password routes

router.post('/devtask/auth/auto-login', UserController.autoLogin);
router.post('/devtask/login', UserMiddleware.login, UserController.login)
router.post('/devtask/register', UserMiddleware.signin, UserController.signin);
router.post('/devtask/forgotpassword', UserMiddleware.forgotPassword, UserController.forgotPassword);
router.post('/devtask/recoverpassword', UserMiddleware.recoverPassword, UserController.recoverPassword);
router.post('/devtask/tokenverification', UserController.tokenVerification );  

export default router;