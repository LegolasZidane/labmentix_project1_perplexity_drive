import { login } from '../../controllers/authController.js';

export default async function handler(req, res){
    
    try{
        if( req.method === "POST" ){
            return await login(req, res);
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }
    } catch(error){
        return res.status(500).json({error: "In /api/auth/login"});
    }
}