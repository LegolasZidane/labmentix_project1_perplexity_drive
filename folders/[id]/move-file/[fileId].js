import { supabaseProxyAuth } from '../../../../middlewares/supabaseProxyAuth.js';
import { moveFileToFolder } from '../../../../controllers/folderController.js';

export default async function handler(req, res){
    
    try{
        const authError = await supabaseProxyAuth(req, res);

        if( authError ) return;

        if( req.method === "PATCH") {
            return await moveFileToFolder(req, res);
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }
    } catch(error){
        return res.status(500).json({error: "In /api/folders/:id/move-file/:fileId"});
    }
}