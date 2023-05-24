import { Request, Response } from "express";

import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from "../models/User";

dotenv.config();

interface DecodeType {
    email: string,
    password?: string
};

export const signin = async (req: Request, res: Response) => {

    const password = JWT.sign({ 
        email: res.locals.email, 
        password: res.locals.password },
        process.env.JWT_SECRET_PASSWORD_KEY as string
    );

    const token = JWT.sign({
        password: res.locals.password},
        process.env.JWT_SECRET_TOKEN_KEY as string
    );

    const user = new User;

    user.name.firstName = res.locals.firstName;
    user.name.lastName = res.locals.lastName;
    user.email = res.locals.email;
    user.password = password;
    user.token = token

    await user.save();

    res.json({token, user: "created"})
};

export const autoLogin = async (req: Request, res: Response) => {

    const { token } = req.body;
    
    const user = await User.findOne({ token });
    
    if(!user) {
        res.status(400).json({ autoLogin: false });
        return;
    };

    const newToken = JWT.sign(
        {password: user.password},
        process.env.JWT_SECRET_TOKEN_KEY as string
    );

    user.token = newToken;

    await user.save();

    res.json({ autoLogin: true, token: newToken });

};

export const login = async (req: Request, res: Response) => {
    
    const { email, password } = res.locals;

    const user = await User.findOne({ email });

    if(!user) {
        res.status(400).json({ error: `email or password invalid.` });
        return;
    };

    const decode = JWT.verify(
        user.password,
        process.env.JWT_SECRET_PASSWORD_KEY as string
    ) as DecodeType;

    if(password !== decode.password || email !== decode.email) {
        res.status(400).json({ error: `email or password invalid.` });
        return;
    };
    
    const token = JWT.sign(
        {password},
        process.env.JWT_SECRET_TOKEN_KEY as string
    );

    user.token = token;

    await user.save();

    res.json({ allowed: true, token });
    
};  

export const forgotPassword = async (req: Request, res: Response) => {

    const user = await User.findOne({ email: res.locals });

    if(!user) {
        res.status(400).json({ error: "not found user" });
        return;
    };

    const token = JWT.sign(
        {email: user.email},
        process.env.JWT_SECRET_RECOVER_PASSWORD as string,
        {expiresIn: '1h'}
    );
    
    const link = `http://127.0.0.1:5173/recoverpassword?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE as string,
        auth: {
            user: process.env.EMAIL as string,
            pass: process.env.EMAIL_PASSWORD as string
        }
    });

    const emailOptions = {
        from: process.env.EMAIL as string,
        to: user.email,
        subject: 'DEVTASK RECUPERAÇÃO DE SENHA',
        html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>devTask Recover Password</title>
            </head>
            <style>
            
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
            
                * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Montserrat', sans-serif;
                }
            
                body {
                    padding-top: 2rem;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 2rem;
                }
            
                h1 {
                    color: #6b21a8;
                    display: flex;
                    align-items: center;
                }
            
                div {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                button {
                    margin: 1rem auto;
                    padding: .5rem 1rem;
                    background: #6b21a8;
                    outline: none;
                    border: 1px solid #6b21a8;
                    border-radius: .25rem;
                    color: white;
                    transition: all .3s ease-in-out;
                }
                button:hover {
                    background: white;
                    color: #6b21a8;
                }
                button:active {
                    scale: .95;
                }
            </style>
            <body>
                <h1>
                    devTask
                </h1>
                <div>
                    <p>Olá,</p>
                    <p>
                        Recebemos uma solicitação para redefinir a senha da sua conta. Para prosseguir com a redefinição da senha, clique no botão abaixo, lembramos que este link é temporario.
                    </p>
                    <a href="${link}"><button>Redefinir Senha</button></a>
                    <p>Se você não solicitou a redefinição da senha, pode ignorar este email.</p>
                    <p>Obrigado,</p>
                    <p>Equipe de Suporte</p>
                </div>
            </body>
            </html>
        `
    };

    try {

        const send = await transporter.sendMail(emailOptions);

        res.json({send: true});

    } catch(error) {
        
        console.log(error);

        res.json({error: 'not send'});
    }


};

export const tokenVerification = async (req: Request, res:Response) => {
    
    const { token } = req.body;

    if(!token) {
        res.status(400).json({ error: 'token required.' })
        return;
    };

    try {

        const decode = JWT.verify(
            token,
            process.env.JWT_SECRET_RECOVER_PASSWORD as string
        ) as DecodeType;

        res.json({ token: true });

    } catch(error) {

        res.status(400).json({error : 'token invalid or expired.'});

    }
}

export const recoverPassword = async (req: Request, res: Response) => {

    let { token, newPassword } = res.locals;

    try {

        const decode = JWT.verify(
            token,
            process.env.JWT_SECRET_RECOVER_PASSWORD as string
        ) as DecodeType;

        const user = await User.findOne({ email: decode.email });

        if(!user) {
            res.status(400).json({ error: 'user not found.' });
            return;
        };

        const password = JWT.sign({ 
            email: user?.email, 
            password: newPassword },
            process.env.JWT_SECRET_PASSWORD_KEY as string
        );

        const newToken = JWT.sign({
            password: newPassword},
            process.env.JWT_SECRET_TOKEN_KEY as string
        );

        user.password = password;
        user.token = newToken;

        await user.save();

        res.json({ recovered: true,  token: newToken});

    } catch(error) {

        res.status(400).json({error : 'token invalid or expired.'});
    };    

};