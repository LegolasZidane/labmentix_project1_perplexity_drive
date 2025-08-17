import { login } from '../../controllers/authController.js';

export default async function handler(req, res){
    
    if( req.method === "POST" ){
        return await login(req, res);
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}