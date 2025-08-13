import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.post('/signup', async(req, res) => {

    const { email, password } = req.body;

    if( !email || !password ){
        return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signUp({email, password});

    if( error ){
        res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Signup successful', data });
});

export default router;