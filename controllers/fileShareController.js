import { supabase } from '../config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

export const shareFile = async (req, res) => {

    try{

        const { fileId } = req.params;
        const { shared_with, permission } = req.body;
        const userId = req.supabaseData.id;

        const { data: fileData, error: fileError } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .eq('owner_id', userId)
            .single();

        if( fileError || !fileData ){
            return res.status(400).json({ error: 'File not found or not owned by you' });
        }

        const { data: sharedData, error: sharedError } = await supabase
            .from('shared_files')
            .upsert([{
                file_id: fileId,
                shared_with: shared_with,
                permission: permission || 'viewer'
            }], { onConflict: ['file_id', 'shared_with'] })
            .select();

        if( sharedError ) throw sharedError;

        const link = `http://localhost:3000/shared/${sharedData[0].id}`;
        res.json({ message: 'File shared', shareableLink: link });

    }   catch(error){
        console.error('Share file error: ', error);
        res.status(500).json({ error: error.message });
    }
};

export const accessSharedFile = async (req, res) => {

    try{

        const { shareId } = req.params;
        const userId = req.supabaseData?.id || null; //maybe null for public link

        const { data: sharedData, error: sharedError } = await supabase
            .from('shared_files')
            .select(`
                file_id,
                permission,
                shared_with,
                files(path, name)    
            `)
            .eq('id', shareId)
            .single();

        if( sharedError || !sharedData ){
            return res.status(404).json({ error: 'Shared file not found' });
        }

        if( sharedData.shared_with && sharedData.shared_with !== userId ){
            return res.status(403).json({ error: 'You do not have access to this file' });
        }

        const { data: signedUrlData, error: urlError } = await supabase
            .storage
            .from(process.env.SUPABASE_BUCKET)
            .createSignedUrl(sharedData.files.path, 36000); //10 hrs for testing
        
        if( urlError ) throw urlError;

        res.json({
            fileName: sharedData.files.name,
            signedUrl: signedUrlData.signedUrl,
            permission: sharedData.permission
        });

    }   catch(error){
        console.error('Access shared file error: ', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSharingPermission = async (req, res) => {

    try{

        const { shareId } = req.params;
        const { permission } = req.body;
        const userId = req.supabaseData.id;

        if( !['viewer', 'editor'].includes(permission) ){
            return res.status(400).json({ error: 'Invalid permission' });
        }

        const { data: sharedData, error: sharedError } = await supabase
            .from('shared_files')
            .select('file_id')
            .eq('id', shareId)
            .single();

        if( sharedError || !sharedData ){
            return res.status(404).json({ error: 'Share entry not found' });
        }

        const { data: fileData, error: fileError } = await supabase
            .from('files')
            .select('files')
            .eq('id', sharedData.file_id)
            .single();
        
        if( fileError || !fileData ){
            return res.status(404).json({ error: 'File not found' });
        }

        const { data, error } = await supabase
            .from('shared_files')
            .update({ permission })
            .eq('id', shareId)
            .select();
        
        if( error ) throw error;
        
        res.json({ message: 'Permission updated successfully', data });

    }   catch(error){
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const revokeSharing = async (req, res) => {

    try{

        const { shareId } = req.params;
        const userId = req.supabaseData.id;

        const { data: shareRecord, error: shareError } = await supabase
            .from('shared_files')
            .select(`
                id,
                file_id,
                files(owner_id)
                `)
            .eq('id', shareId)
            .single();
        
        if( shareError || !shareRecord ){
            return res.status(404).json({ error: "Share record not found" });
        }

        if( shareRecord.files.owner_id !== userId ){
            return res.status(403).json({ error: "Not authorized to revoke" });
        }

        const { error: deleteError } = await supabase
            .from('shared_files')
            .delete()
            .eq('id', shareId);

        if( deleteError ) throw deleteError;

        res.json({ message: "Sharing revoked successfully" });

    }   catch(error){
        return res.status(500).json({ error: error.message });
    }
};

export const listSharedFiles = async (req, res) => {

    try{

        const userId = req.supabaseData.id;

        const { data, error } = await supabase
            .from('shared_files')
            .select(`
                id,
                permission,
                files ( 
                id, 
                name, 
                owner_id,
                owner:auth.users ( email )
                )    
            `)
            .eq('shared_with', userId);

        if( error ) throw error;
                
        res.json({ sharedFiles: data });

    }   catch(error){
        return res.status(500).json({ error: error.message });
    }
};

export const listSharedUsers = async (req, res) => {

    try{

        const { fileId } = req.params;
        const userId = req.supabaseData.id;

        const { data: fileData, error: fileError } = await supabase
            .from('files')
            .select('owner_id')
            .eq('id', fileId)
            .single();

        if( fileError || !fileData ){
            return res.status(404).json({ error: 'File not found' });
        }

        if( fileData.owner_id !== userId ){
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('shared_files')
            .select(`
                id,
                permission,
                shared_with,
                user: auth.users ( email )
            `)
            .eq('file_id', fileId);

        if( error ) throw error;
                
        res.json({ sharedUsers: data });

    }   catch(error){
        return res.status(500).json({ message: error.message });
    }
};