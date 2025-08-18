// import express from 'express';
// import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
// import { upload } from '../middlewares/upload.js';
// import { 
//     uploadFile, 
//     renameFile, 
//     deleteFile, 
//     hardDeleteFile,
//     searchFiles
// } from '../controllers/fileController.js';

// const router = express.Router();

// //Upload file
// router.post(
//     '/upload',
//     supabaseProxyAuth(),
//     upload.single('file'),
//     uploadFile    
// );

// //Rename file
// router.patch('/rename', 
//     supabaseProxyAuth(), 
//     renameFile
// );

// //Soft-delete file
// router.patch(
//     '/delete',
//     supabaseProxyAuth(),
//     deleteFile
// );

// //Perma-delete file
// router.delete(
//     '/hard-delete',
//     supabaseProxyAuth(),
//     hardDeleteFile
// );

// //Search for files
// router.post('/search', supabaseProxyAuth(), searchFiles);

// export default router;