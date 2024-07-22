import jwt from 'jsonwebtoken';
import HttpException from '../utils/exceptions.js';
import APIResponseBuilder from "../utils/api.builder.js";
import { API_KEY } from '../utils/config.js';


// Middleware function to authenticate and extract payload from JWT
const authenticateUser = async (token) => {
    let authUser = null
    const ACCESS_TOKEN_SECRET= process.env.ACCESS_TOKEN_SECRET || "!^w7+ljsg9z96!jzg0j$m#96+b_n$9ww-)9q)twvslor26pymd"

    if (token == null) {
        throw new HttpException(401, 'User not found'); // No token found
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            throw new HttpException(401, 'Invalid authentication token'); // Token is no longer valid
        }
        authUser = user
    });

    return authUser
}
export const SocketAuthMiddleware = async (socket, next) => {
    try {
        const { token } = socket.handshake.query;
        console.log(token)
        socket.user = await authenticateUser(token);
        next();
    } catch (error) {
        // Handle errors by passing them to the Express error handler
        next(new Error('Authentication failed'));
    }
};


const AuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        req.user = await authenticateUser(token);
        next();
    } catch (e){
        APIResponseBuilder.builder().withStatusCode(400).withMessage(e.message).build(res).send()
    }
};

export const ApiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
    next();
};

export default AuthMiddleware;
