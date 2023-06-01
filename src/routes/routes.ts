import { Request, Response, Router } from 'express';

import * as UserMiddleware from '../middlewares/UserMiddlewares';
import * as ImageMiddleware from '../middlewares/ImageMiddlewares';
import * as UserController from '../controllers/UserController';

import * as DashboardController from '../controllers/DashboardController';

const router = Router();

// already tested

router.get('/ping', (req: Request, res: Response) => {
    res.send({'pong': 'true'});
});

// user - login register recover password routes

router.post('/devtask/signin', UserMiddleware.signin, UserController.signin);

router.post('/devtask/auth/auto-login', UserController.autoLogin);
router.post('/devtask/login', UserMiddleware.login, UserController.login)

router.post('/devtask/forgotpassword', UserMiddleware.forgotPassword, UserController.forgotPassword);
router.post('/devtask/tokenverification', UserController.tokenVerification );  
router.put('/devtask/recoverpassword', UserMiddleware.recoverPassword, UserController.recoverPassword);

// below need test

router.get('/devtask/:id/user', UserController.getUserInfo);
router.put('/devtask/:id/user', ImageMiddleware.uploadImage.single('avatar'), UserMiddleware.updateUserInfo, UserController.updateUserInfo);

router.get('/devtask/:id/dashboard', DashboardController.getDashBoardInfo);


export default router;