import { Schema, model, connection, Model } from "mongoose";

type UserType = {
    _id: Schema.Types.ObjectId,
    dateCreated: Date,
    birthday: string,  
    firstName: string,
    lastName: string,
    email: string,
    password: string, 
    token: string,
    avatar: string
};

const schema = new Schema<UserType>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    dateCreated: {type: Date, required: true, default: new Date()},
    birthday: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String, required: true},
    avatar: {type: String}
});

const modelName = 'User';

const User = connection && connection.models[modelName] 
    ? (connection.models[modelName] as Model<UserType>)
    : model<UserType>(modelName, schema);

export default User;