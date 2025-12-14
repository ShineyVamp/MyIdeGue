/**
 * Konfigurasi Supabase Client Terpusat.
 * Digunakan untuk upload gambar (avatar & postingan).
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inisialisasi client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;