import { logout } from '../../controllers/authController.js';
import { supabaseProxyAuth } from '../../middlewares/supabaseProxyAuth.js';

export default async function handler(req, res){
    
    try{
        const authError = await supabaseProxyAuth(req, res);

        if( authError ) return;

        if( req.method === "POST" ){
            return await logout(req, res);
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }
    } catch(error){
        return res.status(500).json({error: "In /api/auth/logout"});
    }
}