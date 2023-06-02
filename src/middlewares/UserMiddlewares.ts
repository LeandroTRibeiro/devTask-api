import { NextFunction, Request, Response } from "express";
import * as ValidateUserData from "../validators/ValidateUserData";
import User from "../schemas/User";
import * as UserTypes from '../types/userTypes';
import JWT from 'jsonwebtoken';
import * as JwtTypes from '../types/jwtTypes';

export const signin = async (req: Request, res: Response, next: NextFunction) => {

    const data: UserTypes.SigninDataType = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    };

    for (let key in data) {
        if(!data[key]) {
            res.status(400).json({ error: `${key} required.` });
            return;
        };
    };

    data.firstName = ValidateUserData.reviewName(data.firstName);
    data.lastName = ValidateUserData.reviewName(data.lastName);
    data.email = ValidateUserData.reviewEmail(data.email);
    data.password = ValidateUserData.reviewPassword(data.password);

    for (let key in data) {
        if(!data[key]) {
            res.status(400).json({ error: `${key} invalid.` });
            return;
        };
    };

    const user = await User.findOne({email: data.email});

    if(user) {
        res.status(400).json({ error: `email already registered.` });
        return;
    };

    res.locals = data;

    next();
};

export const login = async (req: Request, res: Response, next: NextFunction) => {

    const data: UserTypes.LoginDataType = {
        email: req.body.email,
        password: req.body.password
    };

    for (let key in data) {
        if(!data[key]) {
            res.status(400).json({ error: `${key} required.` });
            return;
        };
    };

    data.email = ValidateUserData.reviewEmail(data.email);
    data.password = ValidateUserData.reviewPassword(data.password);

    for (let key in data) {
        if(!data[key]) {
            res.status(400).json({ error: `${key} invalid.` });
            return;
        };
    };

    const user = await User.findOne({email: data.email});

    if(!user) {
        res.status(400).json({ error: `email or password invalid.` });
        return;
    };

    res.locals = data;

    next();
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => { 

    let { email } = req.body;

    if(!email) {
        res.status(400).json({ error: "email required." });
        return;
    };

    email = ValidateUserData.reviewEmail(email);
    
    const user = await User.findOne({ email });

    if(!email || !user) {
        res.status(400).json({ error: "email invalid." });
        return;
    };

    res.locals = email;

    next();
};

export const recoverPassword = async (req:Request, res: Response, next: NextFunction) => {

    let { token, newPassword } = req.body;

    if(!token || !newPassword) {
        res.status(400).json({ error: 'token and new password are required.' })
        return;
    };

    newPassword = ValidateUserData.reviewPassword(newPassword);

    if(!newPassword) {
        res.status(400).json({ error: "password invalid." });
        return;
    };

    res.locals.token = token;
    res.locals.newPassword = newPassword;

    next();
};

export const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    
    const id = req.params.id as string; 
    
    const user = await User.findOne({ _id: id });
    
    if(!user) {
        res.status(400).json({ error: 'not found' });
        return;
    };

    if(Object.keys(req.body).length === 0 && !req.file) {
        res.status(400).json({ error: 'data required' });
        return;
    };

    let data: UserTypes.UpdateDataType = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday
    };

    if(data.firstName !== undefined) data.firstName = ValidateUserData.reviewName(data.firstName);
    if(data.lastName !== undefined) data.lastName = ValidateUserData.reviewName(data.lastName);

    if(data.email !== undefined) {
        data.email = ValidateUserData.reviewEmail(data.email);
        const otherUser = await User.findOne({ email: data.email});
        if(data.email === user.email || otherUser) data.email = undefined;
    };

    if(data.password !== undefined) {
        data.password = ValidateUserData.reviewPassword(data.password);
        const decoded = JWT.verify(
            user.password,
            process.env.JWT_SECRET_PASSWORD_KEY as string
        ) as JwtTypes.DecodeType;
        if(data.password === decoded.password) data.password = undefined;
    };
    
    if(data.birthday !== undefined) data.birthday = ValidateUserData.reviewBirthday(data.birthday);

    for(let key in data) {
        if(data[key] === '') {
            res.status(400).json({ error: `${key} invalid.` });
            return;
        };
    };

    Object.keys(data).map((key) => (data[key] === '' || data[key] === undefined) && delete data[key] );

    if(req.file) data.avatar = req.file;
    
    res.locals = data;

    next();
};

// below middlewares need tests
