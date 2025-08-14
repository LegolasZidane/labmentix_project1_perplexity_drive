import { supabase } from '../config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

export const uploadFile = async (req, res) => {

    try{

        const file = req.file;
        const folderId = req.body.folderId || null;
        const userId = req.supabaseData.id;

        if( !file ){
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = `upload/${Date.now()}-${file.originalname}`;

        const { error: storageError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if( storageError ) throw storageError;

        const { data: dbData, error: dbError } = await supabase
            .from('files')
            .insert([{
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                path: filePath,
                folder_id: folderId,
                owner_id: userId
            }])
            .select();

            if( dbError ){

                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([filePath]);
                throw dbError;

            }

            res.json({
                message: 'File uploaded successfully',
                file: dbData[0]
            });

    } catch (error){
        console.error('Upload error: ', error);
        res.status(500).json({ error: error.message });
    }
};