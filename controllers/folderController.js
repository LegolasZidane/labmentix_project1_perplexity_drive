import { supabase } from '../utils/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export const createFolder = async (req, res) => {

    try{

        const { name, parent_folder_id } = req.body;

        const { data, error } = await supabase
            .from('folders')
            .insert([{
                id: uuidv4(),
                name,
                parent_id: parent_folder_id || null,
                owner_id: req.supabaseData.id
            }])
            .select();

            if( error ) throw error;

            res.status(201).json({ message: 'Folder created', folder: data[0] });

    } catch (error) {
        res.status(400).json({ error: error.message});
    }
};

export const getRootFiles = async (req, res) => {

    try{

        const userId = req.supabaseData.id;

        const { data: folders, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('owner_id', userId)
            .is('parent_id', null);

        const { data: files, error: fileError } = await supabase
            .from('files')
            .select('*')
            .eq('owner_id', userId)
            .is('folder_id', null);

        if( folderError || fileError ) {
            return res.status(500)
            .json({ error: folderError?.message || fileError?.message });
        }

        res.json({ folders, files });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getFoldersFiles = async (req, res) => {

    try{

        const { id } = req.params;
        const userId = req.supabaseData.id;

        const { data: folders, error: folderError } = await supabase
            .from('folders')
            .select('*')
            .eq('owner_id', userId)
            .eq("parent_id", id);

        const { data: files, error: fileError } = await supabase
            .from('files')
            .select('*')
            .eq('owner_id', userId)
            .eq('folder_id', id);

        if( folderError || fileError ) {
            return res.status(500)
            .json({ error: folderError?.message || fileError?.message });
        }

        res.json({ folders, files });

    }   catch(error) {
        res.status(400).json({ error: error.message });
    }
};

export const renameFolder = async (req, res) => {

    try{

        const { name } = req.body;
        const { id } = req.params;

        const {data, error } = await supabase
            .from('folders')
            .update({ name })
            .eq('id', id)
            .eq('owner_id', req.supabaseData.id)
            .select();

        if( error ) throw error;

        res.json({ message: 'Folder renamed', folder: data[0] });

    } catch(error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteFolder = async (req, res) => {

    try{

        const { id } = req.params;

        const { data: files, error: filesError } = await supabase
            .from('files')
            .select('path')
            .eq('folder_id', id)
            .eq('owner_id', req.supabaseData.id);

        if( filesError ) throw filesError;

        for( const file of files){

            await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .remove([file.storage_path]);

        }

        await supabase
            .from('files')
            .delete()
            .eq('folder_id', id)
            .eq('owner_id', req.supabaseData.id);
        
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id)
            .eq('owner_id', req.supabaseData.id);
        
        if( error ) throw error;
        
        res.json({ message: 'Folder deleted successfully' });

    } catch(error){
        res.status(400).json({ error: error.message });
    }
};

export const moveFileToFolder = async (req, res) => {

    try{
        
        const { folderId, fileId } = req.params;

        const targetFolderId = folderId === 'null' ? null : folderId;

        const { data, error } = await supabase
            .from('files')
            .update({ folder_id: targetFolderId })
            .eq('id', fileId)
            .eq('owner_id', req.supabaseData.id)
            .select('*');
        
        if( error ) throw error;

        if( !data || data.length === 0 ){
            return res.status(404).json({ message: 'File not found or no permission' });
        }
        
        res.json({ message: 'File moved', file: data[0] });

    } catch(error){
        res.status(400).json({ error: error.message });
    }
};

export const moveFolderToFolder = async (req, res) => {

    try{

        const { id } = req.params;
        const { new_parent_id } = req.body;

        try{

            const { data: existingFolder, error: fetchError } = await supabase
                .from('folders')
                .select('*')
                .eq('id', id)
                .single();
            
            if( fetchError || !existingFolder ){
                res.json(404).json({ error: 'Folder not found' });
            }

            if( new_parent_id ){

                const { data: targetFolder, error: targetError } = await supabase
                    .from('folders')
                    .select('*')
                    .eq('id', new_parent_id)
                    .single();

                if( targetError || !targetFolder ){
                    return res.status(400).json({ error: 'Target parent folder not found' });
                }
            }

            const { data, error } = await supabase
                .from('folders')
                .update({ parent_id: new_parent_id })
                .eq('id', id)
                .select()
                .single();

            if( error ) throw error;

            res.json({ message: 'Folder moved successfully', folder: data});

        } catch(error){
            res.status(500).json({ error: error.message });
        }
    }   catch(error){
        res.status(400).json({ error: error.message });
    }
};