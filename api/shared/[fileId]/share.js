import { shareFile } from '../../controllers/fileShareController.js';
import { supabaseProxyAuth } from '../../../middlewares/supabaseProxyAuth.js';

export default async function handler(req, res){

    try{
        const authError = await supabaseProxyAuth(req, res);

        if( authError ) return;

        if( req.method === "POST" ){
            return await shareFile(req, res);
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }
    } catch(error){
        return res.status(500).json({ error: "In /api/shared/updatePermission/:shareId" });
    }
}