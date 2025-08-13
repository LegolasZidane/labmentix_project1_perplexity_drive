import express from 'express';
import supabase from '../supabaseClient.js';
import { supabaseProxyAuth } from '../middlewares/supabaseProxyAuth.js';

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

router.post('/login', async(req, res) => {

    const { email, password } = req.body;

    if( !email || !password ){
        return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({email, password});

    if( error ){
        res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Login successful', data });
});

router.post('/logout', supabaseProxyAuth('auth.users'), (req, res) => {

    res.json({
        message: 'Logged Out Successfully!'
    });
});



export default router;