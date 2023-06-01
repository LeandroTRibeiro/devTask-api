import request from 'supertest';
import { app } from '../server';
import { disconnect } from 'mongoose';

// As rotas ja estão sendo testadas pelos testes dos controllers aqui testo somente a rota /ping e not found

afterAll((done) => {
    app.close( async () => {
        disconnect();
        done();
    });
});

describe('Gerenciador de Rotas', () => {


  it('deve retornar um objeto "pong" ao fazer uma requisição GET para /ping', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ pong: 'true' });
  });

});

describe('Teste do servidor', () => {
  it('deve retornar status 404 para uma rota inexistente', async () => {
    const response = await request(app).get('/rota-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ 'not found': true });
  });
});
