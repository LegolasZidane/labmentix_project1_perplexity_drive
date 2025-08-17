import { getFoldersFiles, renameFolder, deleteFolder } from '../controllers/folderController.js';
import { supabaseProxyAuth } from '../../middlewares/supabaseProxyAuth.js';

export default async function handler(req, res){
    
    try{
        const authError = await supabaseProxyAuth(req, res);
        if( authError ) return;

        if( req.method === "GET"){
            return await getFoldersFiles(req, res);
        } else if( req.method === "PATCH"){
            return await renameFolder(req, res);
        } else if( req.method === "DELETE ") {
            return await deleteFolder(req, res);
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }
    } catch(error){
        return res.status(500).json({error: "In /api/folders/:id"});
    }
}