import express from 'express';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
import { upload } from '../middlewares/upload.js';
import { uploadFile } from '../controllers/fileController.js';

const router = express.Router();

router.post(
    '/upload',
    supabaseProxyAuth(),
    upload.single('file'),
    uploadFile    
);

export default router;