import { ErrorRequestHandler } from "express";

import multer from "multer";
import { MulterError } from 'multer';


export const uploadImage = multer({
    dest: './tmp',
    limits: { fileSize: 10485760 },
    fileFilter: (req, file, cb) => {
        const allowed: string[] = ['image/jpg', 'image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('invalid image'));
        }
    },
});

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    res.status(400);

    if (error instanceof MulterError) {
        res.json({ error: error.message });
    } else {
        res.json({ error: 'invalid image' });
    }

};