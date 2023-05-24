import express, { Request, Response } from 'express';
import { mongodbConnect } from './db/mongodb';

import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/routes';
import path from 'path';

dotenv.config();

const server = express();

mongodbConnect();

server.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


server.use(express.static(path.join(__dirname, '../public')));

server.use(express.json());

server.use(router);

server.use((req: Request, res: Response) => res.status(404).send({'not found': true}));

server.listen(process.env.PORT, () => console.log('{ server: true }'));