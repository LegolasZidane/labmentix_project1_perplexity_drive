import { supabase } from '../utils/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

export const uploadFile = async (req, res) => {

    try{

        const file = req.file;
        const folderId = req.body?.folderId || null;
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

export const renameFile = async (req, res) => {

    try{

        const { fileId, newName } = req.body;
        const userId = req.supabaseData.id;

        const { data: fileData, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();
        
        if( fetchError || !fileData ){
            return res.status(404).json({ error: 'File not found' });
        }

        const { data: updatedFile, error: dbError } = await supabase
            .from('files')
            .update({ name: newName })
            .eq('id', fileId)
            .select()
            .single();

        if( dbError ) throw dbError;

        res.json({ message: 'File renamed successfully', file: updatedFile });

    } catch (error){
        console.error('Rename error: ', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteFile = async (req, res) => {

    try{

        const { fileId } = req.body;
        const userId = req.supabaseData.id;

        const { data: fileData, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if( fetchError || !fileData ){
            res.status(404).json({ error: 'Unauthorized' });
        }

        const { data: updatedFile, error: dbError } = await supabase
            .from('files')
            .update({ is_deleted: true })
            .eq('id', fileId)
            .select()
            .single();
        
        if( dbError ) throw dbError;
        
        res.json({
            message: 'File moved to Trash',
            file: updatedFile
        });

    } catch(error){
        console.error('Soft delete error: ', error);
        res.status(500).json({ error: error.message });
    }
};

export const hardDeleteFile = async (req, res) => {

    try{

        const { fileId } = req.body;
        const userId = req.supabaseData.id;

        const { data: fileData, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if( fetchError || !fileData ){
            return res.status(404).json({ error: 'Unauthorized' });
        }

        if( userId && fileData.owner_id !== userId ){
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { error: storageError } = await supabase
            .storage
            .from(process.env.SUPABASE_BUCKET)
            .remove([fileData.path]);

        if( storageError ) throw storageError;

        const {error: dbError } = await supabase
            .from('files')
            .delete()
            .eq('id', fileId);
        
        if( dbError ) throw dbError;

        res.json({ message: 'File hard-deleted successfully '});

    } catch(error) {
        console.error('Hard delete error: ', error);
        res.status(500).json({ error: error.message });
    }
};

export const searchFiles = async (req, res) => {

    try{

        const userId = req.supabaseData.id;
        const { q = "", page = 1, limit = 20 } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));
        const offset = (pageNumber - 1) * limitNumber;

        const { data, error, count } = await supabase
            .from('files')
            .select('*', { count: 'exact' })
            .eq('owner_id', userId)
            .ilike("name", `%${q}%`)
            .range(offset, offset + limitNumber - 1);

        if( error ) throw error;
        
        res.json({
            files: data,
            page: pageNumber,
            limit: limitNumber,
            total: count,
            totalPages: Math.ceil(count / limitNumber)
        });

    }   catch(error) {
        return res.status(500).json({ message: error.message });
    }
};