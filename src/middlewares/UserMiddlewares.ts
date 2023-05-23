import { NextFunction, Request, Response } from "express";
import * as ValidateUserData from "../helpers/ValidateUserData";
import User from "../models/User";

export const signin = async (req: Request, res: Response, next: NextFunction) => {

    type DataType = {
        [firstName: string]: string,
        lastName: string,
        email: string,
        password: string
    }

    const data: DataType = {
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

    type DataType = {
        [email: string]: string,
        password: string
    };

    const data: DataType = {
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