import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

export function supabaseProxyAuth(supabaseEndpoint){
    
    return async(req, res, next) => {

        const authHeader = req.headers.authorization;

        if( !authHeader ){
            return res.status(401).json({ error: `Unauthorized` });
        }

        const token = authHeader.split(' ')[1];

        try{

            const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/${supabaseEndpoint}`, {

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            });

            if( supabaseResponse.status === 401 ){
                return res.status(401).json({ error: `Invalid or expired token` });
            }

            const data = await supabaseResponse.json();
            req.supabaseData = data;

            next();
        } catch ( error ){

            res.status(500).json({ error: 'Server error', details: err.message });

        }
    };
}