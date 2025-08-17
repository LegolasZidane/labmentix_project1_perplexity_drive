import { signup } from '../../controllers/authController.js';

export default async function handler(req, res){
    
    if( req.method === "POST" ){
        return await signup(req, res);
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}