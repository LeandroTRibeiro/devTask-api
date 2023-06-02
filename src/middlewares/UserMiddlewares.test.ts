import { Request, Response, NextFunction } from 'express';
import {
  signin,
  login,
  forgotPassword,
  recoverPassword,
  updateUserInfo
} from './UserMiddlewares';

import User from '../schemas/User';
import JWT from 'jsonwebtoken';

jest.mock('../schemas/User', () => ({
  findOne: jest.fn(),
}));

describe('signin middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    } as unknown as Response;

    next = jest.fn() as NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o próximo middleware se todos os dados de entrada forem fornecidos corretamente e forem válidos', async () => {

    User.findOne = jest.fn().mockResolvedValue(null);

    await signin(req, res, next);

    expect(res.locals).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar um erro de status 400 se algum dos dados de entrada estiver faltando', async () => {

    req.body.firstName = '';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'firstName required.' });

    req.body.firstName = 'John';
    req.body.lastName = '';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'lastName required.' });

    req.body.lastName = 'Doe';
    req.body.email = '';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email required.' });

    req.body.email = 'john.doe@example.com';
    req.body.password = '';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password required.' });

  });

  it('deve retornar um erro de status 400 se algum dos dados de entrada for inválido', async () => {

    req.body.firstName = '    ';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'firstName invalid.' });

    req.body.firstName = 'John';
    req.body.lastName = '    ';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'lastName invalid.' });

    req.body.lastName = 'Doe';
    req.body.email = '     ';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email invalid.' });

    req.body.email = 'john.doe@example.com';
    req.body.password = '    ';

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password invalid.' });
  });

  it('deve retornar um erro de status 400 se o email já estiver registrado no banco de dados', async () => {

    User.findOne = jest.fn().mockResolvedValue({});

    await signin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email already registered.' });
  });
});

describe('login middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        email: 'john.doe@example.com',
        password: 'password123',
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    } as unknown as Response;

    next = jest.fn() as NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o próximo middleware se todos os dados de entrada forem fornecidos corretamente e forem válidos', async () => {

    User.findOne = jest.fn().mockResolvedValue({});

    await login(req, res, next);

    expect(res.locals).toEqual({
      email: 'john.doe@example.com',
      password: 'password123',
    });
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar um erro de status 400 se algum dos dados de entrada estiver faltando', async () => {

    req.body.email = '';

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email required.' });

    req.body.email = 'john.doe@example.com';
    req.body.password = '';

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password required.' });
  });

  it('deve retornar um erro de status 400 se algum dos dados de entrada for inválido', async () => {

    req.body.email = '    ';

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email invalid.' });

    req.body.email = 'john.doe@example.com';
    req.body.password = '    ';

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password invalid.' });
  });

  it('deve retornar um erro de status 400 se o usuário não existir no banco de dados', async () => {

    User.findOne = jest.fn().mockResolvedValue(null);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email or password invalid.' });
  });
});

describe('forgotPassword middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        email: 'john.doe@example.com',
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    } as unknown as Response;

    next = jest.fn() as NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o próximo middleware se o email de entrada for fornecido corretamente e for válido', async () => {

    User.findOne = jest.fn().mockResolvedValue({});

    await forgotPassword(req, res, next);

    expect(res.locals).toEqual('john.doe@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar um erro de status 400 se o email de entrada estiver faltando', async () => {

    req.body.email = '';

    await forgotPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email required.' });
  });

  it('deve retornar um erro de status 400 se o email de entrada for inválido ou não existir no banco de dados', async () => {

    req.body.email = '    ';

    await forgotPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email invalid.' });

    User.findOne = jest.fn().mockResolvedValue(null);

    await forgotPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email invalid.' });
  });
});

describe('recoverPassword middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        token: '123456',
        newPassword: 'newpassword123',
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    } as unknown as Response;

    next = jest.fn() as NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o próximo middleware se o token e a nova senha de entrada forem fornecidos corretamente e forem válidos', async () => {

    await recoverPassword(req, res, next);

    expect(res.locals).toEqual({
      token: '123456',
      newPassword: 'newpassword123',
    });
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar um erro de status 400 se o token ou a nova senha de entrada estiverem faltando', async () => {

    req.body.token = '';

    await recoverPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'token and new password are required.',
    });

    req.body.token = '123456';
    req.body.newPassword = '';

    await recoverPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'token and new password are required.' });
  });

  it('deve retornar um erro de status 400 se a nova senha de entrada for inválida', async () => {

    req.body.token = 'abcdfg'
    req.body.newPassword = '123'

    await recoverPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password invalid.' });
  });
});

describe('updateUserInfo middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = Object.assign({}, req, {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        password: '123456',
        birthday: '1992-04-12'
      },
      params: {
        id: '1234'
      },
    }) as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  it('deve retornar status 400 se o usuário não for encontrado', async () => {

    jest.spyOn(User, 'findOne').mockResolvedValueOnce(undefined);

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o req.body estiver vazio', async () => {

    req.body = {};

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'data required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o firstName for inválido', async () => {

    req.body.firstName = '    ';
    req.body.password = undefined;

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'firstName invalid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o lastName for inválido', async () => {

    req.body.lastName = '    ';
    req.body.password = undefined;

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'lastName invalid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o email for inválido', async () => {

    req.body.email = 'john doe';
    req.body.password = undefined;

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email invalid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o password for inválido', async () => {

    req.body.password = '    ';

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    jest.spyOn(JWT, 'verify').mockImplementation((password, secret) => {
      return {
        password: '123456',
      };
    });


    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'password invalid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar status 400 se o birthday for inválido', async () => {

    req.body.birthday = '    ';

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'birthday invalid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar o next caso as informações forem validas', async () => {

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({});

    await updateUserInfo(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});

