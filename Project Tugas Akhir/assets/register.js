import { supabase } from './supabase.js';

// Event listener untuk tombol register
document.getElementById('register-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validasi input
    if (!email || !username || !password) {
        alert('Harap isi semua kolom!');
        return;
    }

    if (!validatePassword(password)) {
        displayPasswordError(false);
        return;
    }

    try {
        // Insert ke tabel login di Supabase
        const { data, error } = await supabase
            .from('login')
            .insert([{ email, username, password }]);

        if (error) {
            console.error('Error saat mendaftarkan pengguna:', error);
            alert('Gagal mendaftarkan pengguna. Coba lagi!');
        } else {
            alert('Registrasi berhasil! Silakan login.');
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Kesalahan:', err);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
});

// Validasi password
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d|.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return regex.test(password);
}

// Menampilkan atau menyembunyikan error password
document.getElementById('password').addEventListener('input', () => {
    const password = document.getElementById('password').value.trim();
    const isValid = validatePassword(password);
    displayPasswordError(isValid);
});

function displayPasswordError(isValid) {
    const passwordError = document.getElementById('password-error');

    if (isValid) {
        passwordError.hidden = true; // Sembunyikan elemen
    } else {
        passwordError.hidden = false; // Tampilkan elemen
    }
}
