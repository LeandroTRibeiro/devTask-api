import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', true);

export const mongodbConnect = async () => {
    try {
        await connect(process.env.DATABASE_URL as string);
        if(!process.env.NODE_ENV) console.log('{ mongodb: true }');
    } catch(error) {
        if(!process.env.NODE_ENV) console.log('{mongodb : false}', error);
    };
};


