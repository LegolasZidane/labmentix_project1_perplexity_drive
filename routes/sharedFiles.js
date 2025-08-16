import express from 'express';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
import { 
    shareFile,
    accessSharedFile,
    updateSharingPermission,
    revokeSharing,
    listSharedFiles
} from '../controllers/fileShareController.js';

const router = express.Router();

//Share file
router.post('/:fileId/share', supabaseProxyAuth(), shareFile);

//Access a shared file (signed URL)
router.get('/accessShared/:shareId', supabaseProxyAuth(), accessSharedFile);

//Update Sharing Permission
router.put('/updatePermission/:shareId', supabaseProxyAuth(), updateSharingPermission);

//Revoke sharing
router.delete('/revoke/:shareId', supabaseProxyAuth(), revokeSharing);

//List files shared with me
router.get('/sharedWithMe', supabaseProxyAuth(), listSharedFiles);

export default router;