import express from 'express';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';
import { 
    createFolder, 
    renameFolder, 
    deleteFolder, 
    moveFileToFolder, 
    getRootFiles, 
    getFoldersFiles,
    moveFolderToFolder
} from '../controllers/folderController.js';

const router = express.Router();

//Create folder
router.post('/', supabaseProxyAuth, createFolder);

//Folders in root
router.get("/", supabaseProxyAuth, getRootFiles);

//Subfolders of a given folder
router.get("/:id", supabaseProxyAuth, getFoldersFiles);

//Rename folder
router.patch('/:id', supabaseProxyAuth, renameFolder);

//Delete folder
router.delete('/:id', supabaseProxyAuth, deleteFolder);

//Move file to/from folder
router.patch('/:folderId/move-file/:fileId', supabaseProxyAuth, moveFileToFolder);

//Move folder into/outside folder
router.patch('/:id/move', supabaseProxyAuth, moveFolderToFolder);

export default router;