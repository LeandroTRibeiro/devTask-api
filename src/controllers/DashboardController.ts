import { Request, Response } from "express";

import User from "../schemas/User";

export const getDashBoardInfo = async (req: Request, res: Response) => {

    const id = req.params.id as string;
    
    const user = await User.findOne({ _id: id });

    if(!user) {
        res.status(400).json({ error: 'not fount' });
        return;
    };

    res.json({ user });
};