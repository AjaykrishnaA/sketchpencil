import express, { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";


export const auth = (req: Request, res: Response, next: NextFunction) => { 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            "message": "Bearer token not found"
        });
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded) {
            req.userId = (decoded as jwt.JwtPayload).userId;
            next();
        };
    } catch(error) {
        return res.status(401).json({
            "message": "Invalid token!"
        });
    };
};
 