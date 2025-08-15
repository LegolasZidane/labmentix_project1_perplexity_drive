import { supabase } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
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

        let shareId = uuidv4();

        const { data: sharedData, error: sharedError } = await supabase
            .from('shared_files')
            .upsert([{
                file_id: fileId,
                shared_with: shared_with || null,
                permission: permission || 'viewer',
                id: shareId
            }], { onConflict: ['id'] })
            .select();

        if( sharedError ) throw sharedError;

        const link = `http://localhost:3000/shared/${shareId}`;
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
        
        if( urlError ) throw `${urlError} here1`;

        res.json({
            fileName: sharedData.files.name,
            signedUrl: signedUrlData.signedUrl
        });

    }   catch(error){
        console.error('Access shared file error: ', error);
        res.status(500).json({ error: `${error.message} here2` });
    }
};