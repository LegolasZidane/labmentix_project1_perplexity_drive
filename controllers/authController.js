import { supabase } from '../utils/supabaseClient.js';

export const signup = async(req, res) => {

    const { email, password } = req.body;

    if( !email || !password ){
        return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signUp({email, password});

    if( error ){
        res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Signup successful', data });
};

export const login = async(req, res) => {

    const { email, password } = req.body;

    if( !email || !password ){
        return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({email, password});

    if( error ){
        res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Login successful', data });
};

export const logout = (req, res) => {

    res.json({
        message: 'Logged Out Successfully!'
    });
};