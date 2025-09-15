import { supabase } from './supabase.js';

document.getElementById('loginButton').addEventListener('click', async () => {
    const input = document.getElementById('username').value.trim(); // Input bisa berupa email atau username
    const password = document.getElementById('password').value.trim();

    // Validasi input
    if (!input || !password) {
        alert('Harap isi semua kolom!');
        return;
    }

    try {
        // Query data dari tabel login
        const { data, error } = await supabase
            .from('login')
            .select('*')
            .or(`username.eq.${input},email.eq.${input}`) // Cari berdasarkan username atau email
            .eq('password', password);

        if (error) {
            console.error('Error saat memeriksa login:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
            return;
        }

        if (data.length > 0) {
            // Login berhasil
            alert('Login berhasil!');
            window.location.href = 'dashboard.html'; // Arahkan ke halaman dashboard.html
        } else {
            // Login gagal
            alert('Email/Username atau password salah!');
        }
    } catch (err) {
        console.error('Kesalahan:', err);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
});
