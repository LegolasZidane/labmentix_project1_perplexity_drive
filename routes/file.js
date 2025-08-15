import express from 'express';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
import { upload } from '../middlewares/upload.js';
import { uploadFile, renameFile, deleteFile, hardDeleteFile } from '../controllers/fileController.js';

const router = express.Router();

//Upload file
router.post(
    '/upload',
    supabaseProxyAuth(),
    upload.single('file'),
    uploadFile    
);

//Rename file
router.patch('/rename', 
    supabaseProxyAuth(), 
    renameFile
);

//Soft-delete file
router.patch(
    '/delete',
    supabaseProxyAuth(),
    deleteFile
);

router.delete(
    '/hard-delete',
    supabaseProxyAuth(),
    hardDeleteFile
);

export default router;