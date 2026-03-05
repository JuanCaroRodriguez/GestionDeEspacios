import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.handle";


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ message: 'Token is required' });
        }
        const jwt = token.split(' ').pop();
        const isUser = verifyToken(jwt);

        if (!isUser) {
            return res.status(401).send({ message: 'Invalid token' });
        }
        
        next();
    }
    catch(err){
        return res.status(401).send({ message: 'Token is required' });
    }
}

export { authMiddleware };