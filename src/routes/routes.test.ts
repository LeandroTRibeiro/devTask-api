import request from 'supertest';
import { app } from '../server';
import { disconnect } from 'mongoose';
import * as UserController from '../controllers/UserController';

describe('Gerenciador de Rotas', () => {

  it('Deve retornar um objeto "pong" ao fazer uma requisição GET para /ping', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ pong: 'true' });
  });

  it('Deve chamar UserController.autoLogin para /devtask/auth/auto-login', async () => {
    const mockAutoLogin = jest.fn();
    jest.mock(UserController.autoLogin, () => ({
      autoLogin: mockAutoLogin,
    }));

    const response = await request(app).post('/devtask/auth/auto-login');
    expect(response.status).toBe(200);
    expect(mockAutoLogin).toHaveBeenCalled();
  });
});


afterAll((done) => {
    app.close(() => {
        disconnect();
        done();
    });
});