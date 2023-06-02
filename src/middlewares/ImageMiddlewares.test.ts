import * as ImageMiddleware from '../middlewares/ImageMiddlewares';
import { app } from '../server';
import request from 'supertest';
import fs from 'fs';
import { Blob } from 'buffer';
import { disconnect } from 'mongoose';

afterAll((done) => {

    app.close( async () => {
        disconnect();
        done();
    });
});

describe('uploadImage middleware', () => {

    it('deve retornar status 400 caso o tamanho da imagem seja maior do que o esperado', async () => {

        const readableToBuffer = async (readable: any): Promise<Buffer> => {
            const chunks: Uint8Array[] = [];
            for await (const chunk of readable) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        const avatarPath = './public/test-large.png';
        const avatarData = fs.readFileSync(avatarPath);
        const avatarBlob  = new Blob([avatarData], { type: 'image/png' });

        const avatarBuffer = await readableToBuffer(avatarBlob.stream());

        const response = await request(app)
        .put('/devtask/1234/user')
        .attach('avatar', avatarBuffer, 'test-large.png')
        .expect(400);

        expect(response.body).toHaveProperty('error' ,'File too large');

    });

    it('deve retornar status 400 caso o arquivo seja em um formato diferente', async () => {

        const avatarPath = './public/test.txt';
        const avatarData = fs.readFileSync(avatarPath, 'utf-8');
        const avatarBuffer  = Buffer.from(avatarData);

        const response = await request(app)
        .put('/devtask/1234/user')
        .attach('avatar', avatarBuffer, 'test.txt')
        .expect(400);

        expect(response.body).toHaveProperty('error' ,'invalid image');

    });

});
