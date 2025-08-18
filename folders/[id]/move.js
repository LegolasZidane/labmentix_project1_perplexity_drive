import { moveFolderToFolder } from '../../../controllers/folderController.js';
import { supabaseProxyAuth } from '../../../middlewares/supabaseProxyAuth.js';

export default async function handler(req, res){
    
    const authError = await supabaseProxyAuth(req, res);

    if( authError ) return;

    if( req.method === "PATCH"){
        return await moveFolderToFolder(req, res);
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}