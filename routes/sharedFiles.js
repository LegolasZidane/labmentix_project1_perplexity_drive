import express from 'express';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
import { shareFile, accessSharedFile } from '../controllers/fileShareController.js';

const router = express.Router();

//Share file
router.post('/:fileId/share', supabaseProxyAuth(), shareFile);

//Access a shared file (signed URL)
router.get('/:shareId', accessSharedFile);

export default router;