import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

export async function supabaseProxyAuth(req, res){

    try{ 
        const isAccessShared = req.path?.startsWith("/api/shared");
        const authHeader = req.headers.authorization;

        if( !authHeader ){

            if( isAccessShared ){
                return null;
            }

            res.status(401).json({ error: `Unauthorized` });
            return "error";
        }

        const token = authHeader.split(' ')[1];

        try{

            const supabaseResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            });

            if( supabaseResponse.status === 401 ){
                res.status(401).json({ error: `Invalid or expired token` });
                return "error";
            }

            const data = await supabaseResponse.json();
            req.supabaseData = data;
            
            return null;
        } catch ( error ){

            return res.status(500).json({ error: 'Server error', details: error.message });

        }
    }   catch(error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
        return "error";
    }
};