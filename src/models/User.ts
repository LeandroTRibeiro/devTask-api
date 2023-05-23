import { Schema, model, connection, Model } from "mongoose";

type UserType = {
    dateCreated: Date,
    birthday: Date,  
    name : {
        firstName: string,
        lastName: string
    },
    email: string,
    password: string, 
    token: string
};

const schema = new Schema<UserType>({
    dateCreated: {type: Date, required: true, default: new Date()},
    birthday: {type: Date},
    name: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
    },
    email: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String, required: true}
});

const modelName = 'User';

const User = connection && connection.models[modelName] 
    ? (connection.models[modelName] as Model<UserType>)
    : model<UserType>(modelName, schema);

export default User;