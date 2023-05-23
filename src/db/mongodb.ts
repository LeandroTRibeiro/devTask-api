import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', true);

export const mongodbConnect = async () => {
    try {
        await connect(process.env.DATABASE_URL as string);
        console.log('{ mongodb: true }');
    } catch(error) {
        console.log('{mongodb : false}', error);
    };
};



