import { Document } from 'mongoose';

export type UserData = Document & {
    [key: string]: any;
};

export type SigninDataType = {
    [firstName: string]: string,
    lastName: string,
    email: string,
    password: string,
};

export type LoginDataType = {
    [email: string]: string,
    password: string,
};

type DataType = {
    firstName?: string,
    lastName?: string,
    email?: string,
    password?: string,
    birthday?: string,
    avatar?: object;
};

export type UpdateDataType = DataType & {
    [key: string]: string | undefined;
};