import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', true);

export const mongodbConnect = async () => {

    try {

        if(!process.env.NODE_ENV) {
            await connect(process.env.DATABASE_URL as string);
            console.log('{ mongodb: true }');
            return;
        };

        await connect(process.env.DATABASE_URL_TEST as string);

    } catch(error) {

        if(!process.env.NODE_ENV) console.log('{mongodb : false}', error);
        
    };
};


