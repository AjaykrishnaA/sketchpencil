import 'express';
import 'jsonwebtoken';


declare module "express" {
    export interface Request {
        userId?: string;
    }
}


declare module 'jsonwebtoken' {
    export interface JwtPayload {
        userId: string;
    };
};