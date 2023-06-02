import { app } from '../server';
import request from 'supertest';

import User from '../schemas/User';
import { disconnect } from 'mongoose';

import fs from 'fs';
import { Blob } from 'buffer';

import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string
});

afterAll((done) => {

    app.close( async () => {

        const user = await User.findOne({ email: 'lalala@hotmail.com' });

        if(user) {
            await cloudinary.v2.uploader.destroy(user.avatar.substring(user.avatar.lastIndexOf('/') + 1, user.avatar.length - 4));
        }

        await User.deleteMany();
        disconnect();
        done();

    });
});

describe('signin controller', () => {

    it('deve criar um usuario', async () => {
        const response = await request(app)
        .post('/devtask/signin')
        .send({
          firstName: 'John',
          lastName: 'Doe2',
          email: process.env.EMAIL_TEST as string,
          password: 'senha123',
        })
        .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user', 'created');
        expect(response.body).toHaveProperty('id');

    });

    it('não deve criar um usuario com o mesmo email', async () => {
        const response = await request(app)
        .post('/devtask/signin')
        .send({
          firstName: 'John',
          lastName: 'Doe2',
          email: process.env.EMAIL_TEST as string,
          password: 'senha123',
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'email already registered.');
    });
});

describe('autoLogin controller', () => {

    it('deve retornar status 400 caso o token não seja encontrado no banco de dados', async () => {
        const response = await request(app)
        .post('/devtask/auth/auto-login')
        .send({
          token: 'falsetoken'
        })
        .expect(400);

        expect(response.body).toHaveProperty('autoLogin', false);
    });

    it('deve conceder acesso e retornar um novo token e o id caso o token esteja correto', async () => {

        const user = await User.findOne({ email: process.env.EMAIL_TEST as string });

        if(user) {
            const response = await request(app)
            .post('/devtask/auth/auto-login')
            .send({
              token: user.token
            })
            .expect(200);

            expect(response.body).toHaveProperty('autoLogin', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('id');

        };

    });
});

describe('login controller', () => {

    it('deve conceder acesso caso email e senha estejam corretos e retornar um novo token e id', async () => {
        const response = await request(app)
        .post('/devtask/login')
        .send({
          email: process.env.EMAIL_TEST as string,
          password: 'senha123',
        })
        .expect(200);

        expect(response.body).toHaveProperty('allowed', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('id');

    });

    it('deve retornar status 400 caso a senha estaja incorreta', async () => {
        const response = await request(app)
        .post('/devtask/login')
        .send({
          email: process.env.EMAIL_TEST as string,
          password: '123senha',
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'email or password invalid.');
    });

    it('deve retornar status 400 caso o email estaja incorreto', async () => {

        const response = await request(app)
        .post('/devtask/login')
        .send({
          email: 'example@john.com',
          password: 'senha123',
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'email or password invalid.');
    });
});

describe('forgotPassword controller', () => {

    // it('deve enviar o email caso o email esteja correto.', async () => {

    //     const response = await request(app)
    //     .post('/devtask/forgotpassword')
    //     .send({
    //       email: process.env.EMAIL_TEST as string,
    //     })
    //     .expect(200);

    //     expect(response.body).toHaveProperty('send', true);
    // })

    it('deve retornar status 400 caso o email esteja incorreto', async () => {

        const response = await request(app)
        .post('/devtask/forgotpassword')
        .send({
            email: "john@exemple.com",
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'email invalid.');
    });
});

describe('tokenVerification controller', () => {

    it('deve retorar status 400 caso o token não seja enviado', async () => {
        const response = await request(app)
        .post('/devtask/tokenverification')
        .send({
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'token required.');
    });

    it('deve retornar status 400 caso token não seja valido.', async () => {
        const response = await request(app)
        .post('/devtask/tokenverification')
        .send({
            token: 'falsetoeken'
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'token invalid or expired.');
    });
    
    it('deve conceder acesso caso o token seja verdadeiro', async () => {

        const token = JWT.sign(
            {email: 'jhon@example.com'},
            process.env.JWT_SECRET_RECOVER_PASSWORD as string,
            {expiresIn: '1h'}
        );

        const response = await request(app)
        .post('/devtask/tokenverification')
        .send({
            token: token
        })
        .expect(200);

        expect(response.body).toHaveProperty('token', true);
    });
});

describe('recoverPassword controller', () => {

    it('deve renovar a senha se o token e a nova senha forem validos', async () => {

        const token = JWT.sign(
            {email: process.env.EMAIL_TEST as string},
            process.env.JWT_SECRET_RECOVER_PASSWORD as string,
            {expiresIn: '1h'}
        );

        const response = await request(app)
        .put('/devtask/recoverpassword')
        .send({
            token,
            newPassword: 'senha123'
        })
        .expect(200);

        expect(response.body).toHaveProperty('recovered', true);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('id');

    });

    it('deve retornar status 400 caso email não for valido.', async () => {

        const token = JWT.sign(
            {email: "john@doe.com"},
            process.env.JWT_SECRET_RECOVER_PASSWORD as string,
            {expiresIn: '1h'}
        );

        const response = await request(app)
        .put('/devtask/recoverpassword')
        .send({
            token,
            newPassword: 'senha123'
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'user not found.');
    });

    it('deve retornar status 400 caso nova senha não seja valida.', async () => {

        const token = JWT.sign(
            {email: "john@doe.com"},
            process.env.JWT_SECRET_RECOVER_PASSWORD as string,
            {expiresIn: '1h'}
        );

        const response = await request(app)
        .put('/devtask/recoverpassword')
        .send({
            token,
            newPassword: '123'
        })
        .expect(400);

        expect(response.body).toHaveProperty('error', 'password invalid.');
    });

});

describe('getUserInfo controller', () => {

    it('deve retornar todas as informações do usuario', async () => {

        const user = await User.findOne({email: process.env.EMAIL_TEST as string});

        if(user) {
            user.avatar = 'John Doe';
            user.birthday = '1992-04-12';
            await user.save();
        };

        const response = await request(app)
        .get(`/devtask/${user?._id}/user`)
        .expect(200);

        expect(response.body).toHaveProperty('avatar', 'John Doe');
        expect(response.body).toHaveProperty('firstName', 'John');
        expect(response.body).toHaveProperty('lastName', 'Doe2');
        expect(response.body).toHaveProperty('email', process.env.EMAIL_TEST as string);
        expect(response.body).toHaveProperty('password', 'senha123');
        expect(response.body).toHaveProperty('birthday', '1992-04-12');
        
    });

    it('deve retornar status 400 caso o :id não seja valido', async () => {

        const response = await request(app)
        .get(`/devtask/1234/user`)
        .expect(400);

        expect(response.body).toHaveProperty('error', 'not fount');

    });
});

describe('updateUserInfo controller', () => {

    it('deve retornar todas as informações que foram atualizadas do usuário', async () => {

        const user = await User.findOne({email: process.env.EMAIL_TEST as string});

        const readableToBuffer = async (readable: any): Promise<Buffer> => {
            const chunks: Uint8Array[] = [];
            for await (const chunk of readable) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        const avatarPath = './public/test.png';
        const avatarData = fs.readFileSync(avatarPath);
        const avatarBlob  = new Blob([avatarData], { type: 'image/png' });

        const avatarBuffer = await readableToBuffer(avatarBlob.stream());

        const response = await request(app)
        .put(`/devtask/${user?._id}/user`)
        .field('firstName', 'John2')
        .field('lastName', 'Doe3')
        .field('email', 'lalala@hotmail.com')
        .field('password', '987654')
        .field('birthday', '1991-12-09')
        .attach('avatar', avatarBuffer, 'test.png')
        .expect(200);


        expect(response.body).toHaveProperty('update');
        expect(response.body.update).toHaveProperty('avatar');
        expect(response.body.update).toHaveProperty('firstName', 'John2');
        expect(response.body.update).toHaveProperty('lastName', 'Doe3');
        expect(response.body.update).toHaveProperty('email', 'lalala@hotmail.com');
        expect(response.body.update).toHaveProperty('password', '987654');
        expect(response.body.update).toHaveProperty('birthday', '1991-12-09');
        
    });

    it('deve retornar status 400 caso a senha seja igual a atual', async () => {

        const user = await User.findOne({email: 'lalala@hotmail.com'});

        const response = await request(app)
        .put(`/devtask/${user?._id}/user`)
        .field('password', '987654')
        .expect(400);


        expect(response.body).toHaveProperty('error', 'no data changed');
        
    });

});